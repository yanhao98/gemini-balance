function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('复制失败'));
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }
}

function switchTab(type) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[onclick="switchTab('${type}')"]`).classList.add('active');

    // 显示对应的密钥表格
    document.getElementById('validKeys').style.display = type === 'valid' ? '' : 'none';
    document.getElementById('invalidKeys').style.display = type === 'invalid' ? '' : 'none';
}

function copyKeys(type) {
    const keys = Array.from(document.querySelectorAll(`#${type}Keys .key-text`)).map(td => td.textContent.trim());
    const jsonKeys = JSON.stringify(keys);
    
    copyToClipboard(jsonKeys)
        .then(() => {
            showCopyStatus(`已成功复制${type === 'valid' ? '有效' : '无效'}密钥到剪贴板`);
        })
        .catch((err) => {
            console.error('无法复制文本: ', err);
            showCopyStatus('复制失败，请重试');
        });
}

function copyKey(key) {
    copyToClipboard(key)
        .then(() => {
            showCopyStatus(`已成功复制密钥到剪贴板`);
        })
        .catch((err) => {
            console.error('无法复制文本: ', err);
            showCopyStatus('复制失败，请重试');
        });
}

function showCopyStatus(message, type = 'success') {
    const statusElement = document.getElementById('copyStatus');
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.opacity = 1;
    setTimeout(() => {
        statusElement.style.opacity = 0;
        setTimeout(() => {
            statusElement.className = '';
        }, 300);
    }, 2000);
}

async function verifyKey(key, button) {
    try {
        // 禁用按钮并显示加载状态
        button.disabled = true;
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 验证中';

        const response = await fetch(`/gemini/v1beta/verify-key/${key}`, {
            method: 'POST'
        });
        const data = await response.json();

        // 根据验证结果更新UI
        if (data.status === 'valid') {
            showCopyStatus('密钥验证成功', 'success');
            button.style.backgroundColor = 'rgba(56, 161, 105, 0.2)';
        } else {
            showCopyStatus('密钥验证失败', 'error');
            button.style.backgroundColor = 'rgba(229, 62, 62, 0.2)';
        }

        // 3秒后恢复按钮原始状态
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.disabled = false;
            button.style.backgroundColor = '';
        }, 3000);

    } catch (error) {
        console.error('验证失败:', error);
        showCopyStatus('验证请求失败', 'error');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check-circle"></i> 验证';
    }
}

function scrollToTop() {
    const container = document.querySelector('.keys-panel');
    container.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    const container = document.querySelector('.keys-panel');
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

function updateScrollButtons() {
    const container = document.querySelector('.keys-panel');
    const scrollButtons = document.querySelector('.scroll-buttons');
    if (container.scrollHeight > container.clientHeight) {
        scrollButtons.style.display = 'flex';
    } else {
        scrollButtons.style.display = 'none';
    }
}

function refreshPage(button) {
    button.classList.add('loading');
    button.disabled = true;
    
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 默认显示有效密钥
    switchTab('valid');

    // 检查滚动按钮
    // updateScrollButtons();

    // 监听窗口大小变化
    // window.addEventListener('resize', updateScrollButtons);

    // 更新版权年份
    const copyrightYear = document.querySelector('.app-footer script');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
});
