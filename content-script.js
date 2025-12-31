console.log('UIT Survey Auto Complete: Content script loaded');

let isRunning = false;
const DELAY = 300;
const BATCH_STORAGE_KEY = 'uit_survey_batch_mode';
const SINGLE_STORAGE_KEY = 'uit_survey_autofill_running';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getListUrl() {
  if (window.location.href.includes('daa.uit.edu.vn')) {
    return 'https://daa.uit.edu.vn/sinhvien/phieukhaosat';
  }
  return 'https://student.uit.edu.vn/sinhvien/phieukhaosat';
}

function isListPage() {
  return window.location.href.includes('/sinhvien/phieukhaosat') &&
         (window.location.href.includes('student.uit.edu.vn') ||
          window.location.href.includes('daa.uit.edu.vn'));
}

function isSurveyPage() {
  return window.location.href.includes('survey.uit.edu.vn');
}

async function fillAllInputs() {
  console.log('Filling all available inputs...');

  const radioA3 = document.querySelector('input[type="radio"][value="A3"]');
  if (radioA3) {
    radioA3.click();
    console.log('Selected A3 (>80%)');
    await delay(50);
  }

  const radioA5 = document.querySelector('input[type="radio"][value="A5"]');
  if (radioA5) {
    radioA5.click();
    console.log('Selected A5 (Trên 90%)');
    await delay(50);
  }

  const allRadioMH04 = document.querySelectorAll('input[type="radio"][value="MH04"]');
  if (allRadioMH04.length > 0) {
    console.log(`Found ${allRadioMH04.length} rating questions, selecting all 4s...`);
    for (let radio of allRadioMH04) {
      radio.click();
      await delay(30);
    }
    console.log('All ratings set to 4');
  }
}

async function clickNextIfExists(shouldSubmit = false) {
  await delay(DELAY);

  const nextBtn = document.querySelector('#movenextbtn');
  if (nextBtn) {
    console.log('Found "Tiếp theo" button, clicking...');
    nextBtn.click();
    return 'next';
  }

  const submitBtn = document.querySelector('#movesubmitbtn');
  if (submitBtn) {
    if (shouldSubmit) {
      console.log('Found "Gửi" button, clicking...');
      submitBtn.click();
      return 'submitted';
    } else {
      console.log('Found "Gửi" button - STOPPING here (not clicking)');
      return 'submit_found';
    }
  }

  console.log('No navigation button found');
  return 'none';
}

async function autoFillSingleSurvey() {
  console.log('--- Auto-fill single survey mode ---');

  await fillAllInputs();
  const result = await clickNextIfExists(false);

  if (result === 'submit_found' || result === 'none') {
    console.log('Reached submit page, stopping');
    await chrome.storage.local.remove([SINGLE_STORAGE_KEY]);
    isRunning = false;
    return;
  }

  console.log('Page will reload, auto-fill will continue...');
}

async function autoFillBatchSurvey() {
  console.log('--- Auto-fill batch survey mode ---');

  await fillAllInputs();
  const result = await clickNextIfExists(true);

  if (result === 'submitted') {
    console.log('Submitted! Page will reload, waiting for completion page...');
    return;
  }

  if (result === 'next') {
    console.log('Page will reload, auto-fill will continue...');
    return;
  }

  console.log('No button found, something wrong');
}

async function startBatchMode() {
  console.log('=== BATCH MODE: Finding surveys in list ===');

  const links = document.querySelectorAll('a[href*="survey.uit.edu.vn"]');
  const surveyLinks = [];

  for (let link of links) {
    const href = link.href;
    surveyLinks.push(href);
    console.log(`Found survey: ${href}`);
  }

  if (surveyLinks.length === 0) {
    alert('Không tìm thấy khảo sát nào chưa hoàn thành!');
    return;
  }

  const urlsToProcess = surveyLinks;
  console.log(`Processing ${urlsToProcess.length} surveys`);

  const batchData = {
    urls: urlsToProcess,
    currentIndex: 0,
    listUrl: getListUrl()
  };

  await chrome.storage.local.set({ [BATCH_STORAGE_KEY]: batchData });

  console.log('Navigating to first survey...');
  window.location.href = urlsToProcess[0];
}

async function continueBatchMode() {
  const result = await chrome.storage.local.get([BATCH_STORAGE_KEY]);
  const batchData = result[BATCH_STORAGE_KEY];

  if (!batchData) return;

  batchData.currentIndex++;

  console.log(`=== Continuing batch mode: ${batchData.currentIndex}/${batchData.urls.length} ===`);

  if (batchData.currentIndex >= batchData.urls.length) {
    console.log('All surveys completed!');
    await chrome.storage.local.remove([BATCH_STORAGE_KEY]);
    chrome.runtime.sendMessage({ action: 'CLEAR_BADGE' });
    alert(`Đã hoàn thành ${batchData.urls.length} khảo sát!`);
    return;
  }

  await chrome.storage.local.set({ [BATCH_STORAGE_KEY]: batchData });

  await delay(500);
  console.log('Navigating to next survey...');
  window.location.href = batchData.urls[batchData.currentIndex];
}

setTimeout(async () => {
  if (isListPage()) {
    const result = await chrome.storage.local.get([BATCH_STORAGE_KEY]);
    const batchData = result[BATCH_STORAGE_KEY];

    if (batchData) {
      console.log('Detected batch mode continuation in list page');
      continueBatchMode();
    }
  } else if (isSurveyPage()) {
    const bodyText = document.body.textContent;
    if (bodyText.includes('Token mismatch') || bodyText.includes("doesn't match")) {
      console.log('Detected token mismatch error, reloading page...');
      await delay(500);
      window.location.reload();
      return;
    }

    const result = await chrome.storage.local.get([BATCH_STORAGE_KEY, SINGLE_STORAGE_KEY]);
    const batchData = result[BATCH_STORAGE_KEY];
    const singleMode = result[SINGLE_STORAGE_KEY];

    if (batchData && bodyText.includes('HOÀN THÀNH KHẢO SÁT')) {
      console.log('Survey completed! Going back to list...');
      await delay(1000);
      window.location.href = batchData.listUrl;
      return;
    }

    if (batchData) {
      console.log('Detected batch mode in survey page');
      isRunning = true;
      autoFillBatchSurvey();
    } else if (singleMode === true) {
      console.log('Detected single mode in survey page');
      isRunning = true;
      autoFillSingleSurvey();
    }
  }
}, 800);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_AUTO_FILL') {
    if (isRunning) {
      sendResponse({ status: 'already_running' });
      return;
    }

    if (isListPage()) {
      startBatchMode();
      sendResponse({ status: 'batch_started' });
    } else if (isSurveyPage()) {
      isRunning = true;
      chrome.storage.local.set({ [SINGLE_STORAGE_KEY]: true });
      autoFillSingleSurvey();
      sendResponse({ status: 'single_started' });
    } else {
      sendResponse({ status: 'unsupported_page' });
    }
  }

  return true;
});
