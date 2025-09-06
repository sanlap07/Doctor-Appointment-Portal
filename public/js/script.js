// Main JavaScript for Doctor Appointment System

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    initializeDatePickers();
    initializeFormValidation();
});

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize date pickers with minimum date as today
function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        if (input.getAttribute('min') === null) {
            input.setAttribute('min', today);
        }
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// Search functionality
function searchDoctors() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const query = document.getElementById('searchQuery').value.trim();
            if (query.length < 2) {
                e.preventDefault();
                alert('Please enter at least 2 characters to search');
            }
        });
    }
}

// Live search for doctors
function liveSearchDoctors(query) {
    if (query.length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    fetch(`/api/doctors/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data.doctors);
        })
        .catch(error => {
            console.error('Search error:', error);
        });
}

// Display search results
function displaySearchResults(doctors) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (doctors.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">No doctors found</p>';
        return;
    }
    
    let html = '<div class="row g-3">';
    doctors.forEach(doctor => {
        html += `
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-body">
                        <h6 class="fw-bold">Dr. ${doctor.name}</h6>
                        <p class="text-primary small mb-1">${doctor.specialization}</p>
                        <p class="text-muted small mb-2">${doctor.department}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-success fw-bold">$${doctor.consultationFee}</span>
                            <a href="/doctor/${doctor._id}" class="btn btn-sm btn-outline-primary">View</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    resultsContainer.innerHTML = html;
}

// Appointment booking functionality
function loadAvailableSlots(doctorId, date) {
    const timeSlotSelect = document.getElementById('timeSlot');
    if (!timeSlotSelect) return;
    
    timeSlotSelect.disabled = true;
    timeSlotSelect.innerHTML = '<option value="">Loading...</option>';
    
    fetch(`/api/doctors/${doctorId}/available-slots/${date}`)
        .then(response => response.json())
        .then(data => {
            timeSlotSelect.innerHTML = '';
            
            if (data.availableSlots.length === 0) {
                timeSlotSelect.innerHTML = '<option value="">No slots available</option>';
                timeSlotSelect.disabled = true;
            } else {
                timeSlotSelect.innerHTML = '<option value="">Select time slot</option>';
                data.availableSlots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSlotSelect.appendChild(option);
                });
                timeSlotSelect.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error loading slots:', error);
            timeSlotSelect.innerHTML = '<option value="">Error loading slots</option>';
            timeSlotSelect.disabled = true;
        });
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div> Loading...';
        element.disabled = true;
    }
}

// Hide loading spinner
function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

// Confirm action with modal or alert
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Show success message
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Show error message
function showErrorMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    });
});

// Password strength checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;
    
    let strength = 0;
    const checks = [
        /.{8,}/, // At least 8 characters
        /[a-z]/, // Lowercase letter
        /[A-Z]/, // Uppercase letter
        /[0-9]/, // Number
        /[^A-Za-z0-9]/ // Special character
    ];
    
    checks.forEach(check => {
        if (check.test(password)) strength++;
    });
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['danger', 'warning', 'info', 'primary', 'success'];
    
    strengthIndicator.textContent = strengthLevels[strength] || '';
    strengthIndicator.className = `text-${strengthColors[strength] || 'muted'}`;
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}