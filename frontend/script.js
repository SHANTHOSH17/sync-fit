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

    // Form submission integration
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('syncfit_user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        }
    });

    const signupForm = document.getElementById('signup-form');
    const signupBtn = signupForm.querySelector('button[type="submit"]');
    const gymIdDisplay = document.getElementById('gym-id-display');
    const generatedGymId = document.getElementById('generated-gym-id');
    const continueBtn = document.getElementById('continue-to-dashboard');
    
    if(continueBtn) {
        continueBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('syncfit_user', JSON.stringify(data.user));
                
                // Show Gym ID and hide submit button
                signupBtn.style.display = 'none';
                gymIdDisplay.style.display = 'block';
                generatedGymId.textContent = data.user.gym_id;
                
                // Disable inputs
                document.getElementById('signup-name').disabled = true;
                document.getElementById('signup-email').disabled = true;
                document.getElementById('signup-password').disabled = true;
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        }
    });
});
