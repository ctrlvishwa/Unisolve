// Firebase Configuration
let db, storage;
let uploadedFileURL = '';
let uploadedScreenshotURL = '';
let uploadedFileData = null;

// Initialize Firebase
function initializeFirebase() {
    // Configuration will be loaded from firebase-config.js
    db = getDatabase();
    storage = getStorage();
}

// Form Navigation
let currentStep = 1;

function nextStep() {
    if (validateStep(currentStep)) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        
        if (currentStep === 3) {
            updatePaymentSummary();
        }
        
        window.scrollTo({ top: document.querySelector('.upload-form-wrapper').offsetTop - 100, behavior: 'smooth' });
    }
}

function prevStep() {
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    window.scrollTo({ top: document.querySelector('.upload-form-wrapper').offsetTop - 100, behavior: 'smooth' });
}

function validateStep(step) {
    const form = document.getElementById('uploadForm');
    const inputs = form.querySelectorAll(`#step${step} input[required], #step${step} select[required], #step${step} textarea[required]`);
    
    for (let input of inputs) {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            setTimeout(() => input.style.borderColor = '', 3000);
            return false;
        }
    }
    return true;
}

// Pricing Functions
function updatePricing() {
    const pages = parseInt(document.getElementById('sidebarPages').value) || 1;
    const totalPrice = pages * 5;
    const advancePrice = pages * 1;
    const balancePrice = totalPrice - advancePrice;
    
    document.getElementById('totalPrice').textContent = '₹' + totalPrice;
    document.getElementById('advancePrice').textContent = '₹' + advancePrice;
    document.getElementById('balancePrice').textContent = '₹' + balancePrice;
    
    // Update form input
    document.querySelector('input[name="pages"]').value = pages;
    
    updatePaymentSummary();
}

function setPages(pages) {
    document.getElementById('sidebarPages').value = pages;
    updatePricing();
    scrollToUpload();
}

function selectPackage(pages) {
    document.getElementById('sidebarPages').value = pages;
    updatePricing();
    scrollToUpload();
}

function updatePaymentSummary() {
    const pages = parseInt(document.querySelector('input[name="pages"]').value) || 1;
    const totalPrice = pages * 5;
    const advancePrice = pages * 1;
    const balancePrice = totalPrice - advancePrice;
    
    document.getElementById('summaryPages').textContent = pages;
    document.getElementById('summaryTotal').textContent = totalPrice;
    document.getElementById('summaryAdvance').textContent = advancePrice;
    document.getElementById('summaryRemaining').textContent = balancePrice;
    document.getElementById('qrAmount').textContent = advancePrice;
}

// File Upload Handling
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebase();
    
    const assignmentInput = document.getElementById('assignmentFile');
    if (assignmentInput) {
        assignmentInput.addEventListener('change', handleFileUpload);
        
        const fileUpload = assignmentInput.parentElement;
        fileUpload.addEventListener('click', () => assignmentInput.click());
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.background = 'rgba(30,64,175,0.05)';
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.background = '';
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            assignmentInput.files = e.dataTransfer.files;
            handleFileUpload();
        });
    }

    const paymentInput = document.getElementById('paymentScreenshot');
    if (paymentInput) {
        paymentInput.addEventListener('change', handlePaymentScreenshot);
        
        const fileUpload = paymentInput.parentElement;
        fileUpload.addEventListener('click', () => paymentInput.click());
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.background = 'rgba(30,64,175,0.05)';
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.background = '';
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            paymentInput.files = e.dataTransfer.files;
            handlePaymentScreenshot();
        });
    }
});

function handleFileUpload() {
    const input = document.getElementById('assignmentFile');
    const fileInfo = document.getElementById('fileInfo');
    const uploadProgress = document.getElementById('uploadProgress');
    
    if (input.files.length > 0) {
        const file = input.files[0];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF file or image (JPG/PNG)');
            return;
        }
        
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }
        
        // Show progress
        uploadProgress.classList.remove('hidden');
        
        // Simulate upload (in real scenario, upload to Firebase Storage)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Store file info for form submission
                uploadedFileData = {
                    name: file.name,
                    size: sizeMB,
                    type: file.type,
                    url: URL.createObjectURL(file)
                };
                
                fileInfo.innerHTML = `✓ ${file.name} (${sizeMB} MB) - ${file.type.includes('pdf') ? 'PDF' : 'Image'}`;
                fileInfo.classList.remove('hidden');
                setTimeout(() => uploadProgress.classList.add('hidden'), 1000);
            }
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = 'Uploading... ' + Math.floor(progress) + '%';
        }, 100);
        
        uploadedFileURL = URL.createObjectURL(file);
    }
}

function handlePaymentScreenshot() {
    const input = document.getElementById('paymentScreenshot');
    const fileInfo = document.getElementById('screenshotInfo');
    
    if (input.files.length > 0) {
        const file = input.files[0];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.innerHTML = `✓ ${file.name} (${sizeMB} MB)`;
        fileInfo.classList.remove('hidden');
        
        uploadedScreenshotURL = URL.createObjectURL(file);
    }
}

// Form Submission
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate that file is uploaded
    if (!uploadedFileData) {
        alert('Please upload your assignment file first');
        return;
    }
    
    const formData = {
        fullName: document.querySelector('input[name="fullName"]').value,
        tcaNumber: document.querySelector('input[name="tcaNumber"]').value,
        year: document.querySelector('select[name="year"]').value,
        college: document.querySelector('select[name="college"]').value,
        courseName: document.querySelector('input[name="courseName"]').value,
        phone: document.querySelector('input[name="phone"]').value,
        email: document.querySelector('input[name="email"]').value,
        pages: parseInt(document.querySelector('input[name="pages"]').value),
        specialNotes: document.querySelector('textarea[name="specialNotes"]').value,
        totalAmount: parseInt(document.querySelector('input[name="pages"]').value) * 5,
        advanceAmount: parseInt(document.querySelector('input[name="pages"]').value) * 1,
        balanceAmount: (parseInt(document.querySelector('input[name="pages"]').value) * 5) - (parseInt(document.querySelector('input[name="pages"]').value) * 1),
        assignmentFile: uploadedFileData,
        paymentScreenshot: uploadedScreenshotURL,
        timestamp: new Date().toISOString(),
        status: 'pending_verification'
    };
    
    try {
        // Save to Firebase
        await saveOrderToDatabase(formData);
        
        // Show success message
        document.getElementById('step3').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        document.getElementById('orderId').textContent = 'NG-' + Date.now();
        
        // Send WhatsApp notification
        sendWhatsAppNotification(formData);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error submitting order. Please try again.');
    }
});

async function saveOrderToDatabase(formData) {
    try {
        // Save to Firebase Realtime Database
        const ordersRef = dbRef(database, 'orders');
        const newOrderRef = push(ordersRef);
        
        await set(newOrderRef, {
            ...formData,
            orderId: 'US-' + Date.now(),
            createdAt: new Date().toISOString(),
            status: 'pending_verification',
            paymentVerified: false
        });
        
        console.log('Order saved:', newOrderRef.key);
        
        // Start automated payment verification
        startPaymentVerification(newOrderRef.key, formData);
        
        return newOrderRef.key;
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

function startPaymentVerification(orderId, formData) {
    // Simulate automated payment verification
    setTimeout(() => {
        // In real implementation, this would verify payment via UPI webhook
        verifyPaymentAndConfirmOrder(orderId, formData);
    }, 5000); // 5 seconds for demo
}

async function verifyPaymentAndConfirmOrder(orderId, formData) {
    try {
        // Update order status to confirmed
        const orderRef = dbRef(database, `orders/${orderId}`);
        await set(orderRef, {
            ...formData,
            status: 'payment_confirmed',
            paymentVerified: true,
            confirmedAt: new Date().toISOString()
        });
        
        // Send confirmation notification
        sendAutomatedConfirmation(formData);
        
        console.log('Payment verified and order confirmed:', orderId);
    } catch (error) {
        console.error('Error confirming order:', error);
    }
}

function sendAutomatedConfirmation(formData) {
    // Send WhatsApp notification
    const message = `✅ Payment Confirmed! Your assignment order has been verified.\n\nOrder Details:\n- Order ID: US-${Date.now()}\n- Pages: ${formData.pages}\n- Amount: ₹${formData.totalAmount}\n\nWe'll start working on your assignment immediately. Expected delivery: 2-3 days.`;
    
    // In real implementation, use WhatsApp API
    console.log('Automated confirmation sent:', message);
}

function sendWhatsAppNotification(formData) {
    const message = `Hi ${formData.fullName}, Your assignment order has been received!\n\nOrder Details:\n- Pages: ${formData.pages}\n- Advance Paid: ₹${formData.advanceAmount}\n- Total Amount: ₹${formData.totalAmount}\n\nWe will verify your payment and start working on your assignment. Thank you!`;
    const whatsappLink = `https://wa.me/917255899651?text=${encodeURIComponent(message)}`;
    console.log('WhatsApp Link:', whatsappLink);
}

function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(step => step.classList.add('hidden'));
    document.getElementById('step1').classList.remove('hidden');
}

function resetForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');
    document.querySelectorAll('.form-step').forEach(step => step.classList.add('hidden'));
    currentStep = 1;
    document.getElementById('step1').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});