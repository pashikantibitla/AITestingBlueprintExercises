document.getElementById('convertBtn').addEventListener('click', async () => {
    const javaSource = document.getElementById('javaSource').value;
    const btn = document.getElementById('convertBtn');
    const status = document.getElementById('statusBar');
    const output = document.getElementById('tsOutput');
    const filePathLabel = document.getElementById('filePath');

    if (!javaSource.trim()) {
        status.innerText = "Please paste some Java code first.";
        return;
    }

    // UI Loading State
    btn.disabled = true;
    btn.innerText = "Converting...";
    status.innerText = "Processing...";

    try {
        const response = await fetch('http://localhost:8000/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_code: javaSource,
                project_name: "MyTest"  // Default name
            })
        });

        const data = await response.json();

        if (data.success) {
            output.value = data.converted_code;
            status.innerText = "Conversion Complete. " + (data.logs.length > 0 ? data.logs[data.logs.length - 1] : "");
            filePathLabel.innerText = data.file_path;
        } else {
            output.value = "// Error: " + data.logs.join('\n');
            status.innerText = "Conversion Failed.";
        }
    } catch (error) {
        console.error(error);
        status.innerText = "Error: Could not connect to backend server. Is it running?";
    } finally {
        btn.disabled = false;
        btn.innerText = "Convert Code";
    }
});
