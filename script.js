document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const filterOptions = document.getElementById('filter-options');
    const convertButton = document.getElementById('convert-button');
    const goBackButton = document.getElementById('go-back-button');
    const originalCanvas = document.getElementById('original-canvas');
    const editedCanvas = document.getElementById('edited-canvas');
    const resultContainer = document.querySelector('.result-container');
    const formContainer = document.querySelector('.form-container');

    let originalImage = null;

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalCanvas.width = img.width;
                    originalCanvas.height = img.height;
                    editedCanvas.width = img.width;
                    editedCanvas.height = img.height;
                    const ctx = originalCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    originalImage = ctx.getImageData(0, 0, img.width, img.height);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    convertButton.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please upload an image first!');
            return;
        }

        const filter = filterOptions.value;
        const editedCtx = editedCanvas.getContext('2d');
        const imageData = new ImageData(
            new Uint8ClampedArray(originalImage.data),
            originalImage.width,
            originalImage.height
        );

        if (filter === 'grayscale') {
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const gray = 0.3 * r + 0.59 * g + 0.11 * b;
                imageData.data[i] = gray;
                imageData.data[i + 1] = gray;
                imageData.data[i + 2] = gray;
            }
        } else if (filter === 'blur') {
            const tempData = new Uint8ClampedArray(imageData.data);
            const width = imageData.width;
            const height = imageData.height;
            const kernelSize = 3;
            const halfKernel = Math.floor(kernelSize / 2);

            for (let y = halfKernel; y < height - halfKernel; y++) {
                for (let x = halfKernel; x < width - halfKernel; x++) {
                    let r = 0, g = 0, b = 0, count = 0;

                    for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                            r += tempData[pixelIndex];
                            g += tempData[pixelIndex + 1];
                            b += tempData[pixelIndex + 2];
                            count++;
                        }
                    }

                    const index = (y * width + x) * 4;
                    imageData.data[index] = r / count;
                    imageData.data[index + 1] = g / count;
                    imageData.data[index + 2] = b / count;
                }
            }
        }

        editedCtx.putImageData(imageData, 0, 0);
        formContainer.style.display = 'none';
        resultContainer.style.display = 'block';
    });

    goBackButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        formContainer.style.display = 'block';
    });
});