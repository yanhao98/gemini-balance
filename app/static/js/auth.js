document.addEventListener('DOMContentLoaded', () => {
    const copyrightYear = document.querySelector('.copyright script');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
});
