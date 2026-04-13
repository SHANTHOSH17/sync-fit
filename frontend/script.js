document.addEventListener('DOMContentLoaded', () => {
    const loginPanel = document.getElementById('login-panel');
    const signupPanel = document.getElementById('signup-panel');
    const toSignup = document.getElementById('to-signup');
    const toLogin = document.getElementById('to-login');

    const switchPanel = (hidePanel, showPanel) => {
        hidePanel.classList.add('fade-out');
        
        setTimeout(() => {
            hidePanel.classList.add('hidden');
            hidePanel.classList.remove('fade-out');
            
            showPanel.classList.remove('hidden');
            showPanel.classList.add('fade-in');
            
            setTimeout(() => {
                showPanel.classList.remove('fade-in');
            }, 500);
        }, 400); // match animation duration
    };

    toSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchPanel(loginPanel, signupPanel);
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchPanel(signupPanel, loginPanel);
    });

    // Form submission simulation
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = 'dashboard.html';
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const gymId = document.getElementById('signup-gym-id').value;
        if(gymId) {
            window.location.href = 'dashboard.html';
        }
    });
});
