const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');

async function checkRunningStatus() {
  const result = await chrome.storage.local.get(['uit_survey_batch_mode', 'uit_survey_autofill_running']);
  const isRunning = result.uit_survey_batch_mode || result.uit_survey_autofill_running;

  if (isRunning) {
    startBtn.textContent = 'Dừng lại';
    startBtn.classList.add('stop');
    statusDiv.style.display = 'block';
    statusDiv.textContent = 'Extension đang chạy...';
  } else {
    startBtn.textContent = 'Bắt đầu tự động điền';
    startBtn.classList.remove('stop');
    statusDiv.style.display = 'none';
  }

  return isRunning;
}

checkRunningStatus();

startBtn.addEventListener('click', async () => {
  const isRunning = await checkRunningStatus();

  if (isRunning) {
    statusDiv.textContent = 'Đang dừng...';

    const result = await chrome.storage.local.get(['uit_survey_batch_mode']);
    const batchData = result.uit_survey_batch_mode;
    const listUrl = batchData?.listUrl || 'https://student.uit.edu.vn/sinhvien/phieukhaosat';

    await chrome.storage.local.clear();
    chrome.runtime.sendMessage({ action: 'CLEAR_BADGE' });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('survey.uit.edu.vn')) {
      chrome.tabs.update(tab.id, { url: listUrl });
    }

    statusDiv.textContent = 'Đã dừng!';
    setTimeout(() => {
      window.close();
    }, 1000);
    return;
  }

  startBtn.disabled = true;
  statusDiv.style.display = 'block';
  statusDiv.classList.remove('warning');
  statusDiv.textContent = 'Đang bắt đầu...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const isValidPage = tab.url.includes('survey.uit.edu.vn') ||
                         tab.url.includes('student.uit.edu.vn/sinhvien/phieukhaosat') ||
                         tab.url.includes('daa.uit.edu.vn/sinhvien/phieukhaosat');

    if (!isValidPage) {
      statusDiv.classList.add('warning');
      statusDiv.textContent = 'Lỗi: Vui lòng mở trang khảo sát hoặc danh sách khảo sát!';
      startBtn.disabled = false;
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'START_AUTO_FILL' }, (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.classList.add('warning');
        statusDiv.textContent = 'Lỗi: ' + chrome.runtime.lastError.message;
        startBtn.disabled = false;
        return;
      }

      if (response.status === 'batch_started' || response.status === 'single_started') {
        chrome.runtime.sendMessage({ action: 'SET_BADGE_RUNNING' });
        statusDiv.textContent = response.status === 'batch_started' ? 'Bắt đầu batch mode!' : 'Bắt đầu single mode!';
        setTimeout(() => {
          window.close();
        }, 1500);
      } else if (response.status === 'already_running') {
        statusDiv.textContent = 'Extension đang chạy rồi!';
        startBtn.disabled = false;
      }
    });
  } catch (error) {
    statusDiv.classList.add('warning');
    statusDiv.textContent = 'Lỗi: ' + error.message;
    startBtn.disabled = false;
  }
});
