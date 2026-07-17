// Neutralino Initialization
Neutralino.init();

Neutralino.events.on("ready", () => {
    // DevTools automatic launch removed as requested
});

// Fix Close Button
Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});

document.addEventListener('DOMContentLoaded', () => {
    const dropzone1 = document.getElementById('dropzone-1');
    const dropzone2 = document.getElementById('dropzone-2');
    const mergeBtn = document.getElementById('merge-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    
    // State to track loaded files (now storing absolute paths)
    let file1Path = null;
    let file2Path = null;

    // Handle clicks to open native file selector
    const setupClickEvent = (dropzone, fileNum) => {
        dropzone.addEventListener('click', async () => {
            try {
                let entries = await Neutralino.os.showOpenDialog('Select PDF', {
                    filters: [
                        {name: 'PDF files', extensions: ['pdf']}
                    ]
                });
                
                if (entries && entries.length > 0) {
                    const filePath = entries[0];
                    // We need a pseudo-file object to match previous UI logic
                    const fileName = filePath.split('\\').pop().split('/').pop();
                    handleFileSelection({ name: fileName, path: filePath, size: 0 }, fileNum);
                }
            } catch (err) {
                console.error("Error opening file dialog:", err);
            }
        });
    };

    setupClickEvent(dropzone1, 1);
    setupClickEvent(dropzone2, 2);

    // Handle Drag and Drop
    const setupDragAndDrop = (dropzone, fileNum) => {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type === 'application/pdf') {
                    // In Neutralino/WebView2, dropped files often have a path property
                    if (file.path) {
                         handleFileSelection(file, fileNum);
                    } else {
                         alert('Cannot get absolute path from drag & drop. Please click to select the file.');
                    }
                } else {
                    alert('Please select a valid PDF file.');
                }
            }
        });
    };

    setupDragAndDrop(dropzone1, 1);
    setupDragAndDrop(dropzone2, 2);

    // Handle File Selection UI update
    const handleFileSelection = (file, fileNum) => {
        const fileNameSpan = document.getElementById(`file-name-${fileNum}`);
        const contentDiv = document.getElementById(`content-${fileNum}`);
        const successIndicator = contentDiv.querySelector('.success-indicator');
        const icon = contentDiv.querySelector('.drop-icon');
        
        // Update text
        let sizeText = file.size > 0 ? `<br><small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>` : '';
        fileNameSpan.innerHTML = `<strong>${file.name}</strong>${sizeText}`;
        
        // Show success indicator
        successIndicator.classList.remove('hidden');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.color = 'var(--success-color)';
        
        // Add subtle pop animation
        gsap.fromTo(contentDiv, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: "back.out(1.7)" });

        if (fileNum === 1) file1Path = file.path;
        if (fileNum === 2) file2Path = file.path;

        checkMergeButton();
    };

    const checkMergeButton = () => {
        if (file1Path && file2Path) {
            mergeBtn.removeAttribute('disabled');
            gsap.fromTo(mergeBtn, { scale: 1 }, { scale: 1.05, yoyo: true, repeat: 1, duration: 0.2, ease: "power1.inOut" });
        } else {
            mergeBtn.setAttribute('disabled', 'true');
        }
    };

    // Merge Animation Process
    mergeBtn.addEventListener('click', async () => {
        
        // 1. Prompt user for output save location
        let outputPath = null;
        try {
            outputPath = await Neutralino.os.showSaveDialog('Save Merged PDF', {
                filters: [{name: 'PDF files', extensions: ['pdf']}]
            });
        } catch (e) {
            console.error("Save dialog cancelled or failed", e);
            return;
        }

        if (!outputPath) return; // User cancelled

        // Ensure it has .pdf extension
        if (!outputPath.toLowerCase().endsWith('.pdf')) {
            outputPath += '.pdf';
        }

        mergeBtn.setAttribute('disabled', 'true');
        mergeBtn.innerHTML = '<span>Processing...</span><i class="fa-solid fa-spinner fa-spin"></i>';

        const tl = gsap.timeline();
        const mergingIndicator = document.getElementById('merging-indicator');
        const progressBar = document.getElementById('progress-bar');
        
        mergingIndicator.classList.remove('hidden');

        const isMobile = window.innerWidth <= 600;
        const moveDropzone1 = isMobile ? { y: '50%', scale: 0.7, opacity: 0 } : { x: '55%', scale: 0.7, opacity: 0 };
        const moveDropzone2 = isMobile ? { y: '-50%', scale: 0.7, opacity: 0 } : { x: '-55%', scale: 0.7, opacity: 0 };

        // "Zipping" animation
        tl.to('#content-1, #content-2', { opacity: 0, duration: 0.4, ease: "power2.inOut" })
          .to(dropzone1, { ...moveDropzone1, duration: 0.8, ease: "back.in(1.2)" }, "-=0.2")
          .to(dropzone2, { ...moveDropzone2, duration: 0.8, ease: "back.in(1.2)" }, "<")
          .to(mergingIndicator, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, "-=0.2");
          
        // While animation holds, execute Python backend
        try {
            // Use quotes to handle paths with spaces
            // Change to the bin directory first to avoid issues with spaces in the executable path,
            // then run main.exe.
            const command = `cd /d "${NL_CWD}/bin" && main.exe "${file1Path}" "${file2Path}" "${outputPath}"`;
            
            // Start indefinite progress bar loading
            gsap.to(progressBar, { width: '80%', duration: 2, ease: "power1.out" });

            let info = await Neutralino.os.execCommand(command);
            console.log("Backend Output:", info);
            
            if (info.exitCode !== 0) {
                alert("Merge Failed!\n\nError: " + info.stdErr + "\nOutput: " + info.stdOut);
                startOverBtn.click();
                return;
            }
            
            // Finish progress bar instantly
            gsap.to(progressBar, { width: '100%', duration: 0.5, onComplete: showSuccessState });
            
        } catch (error) {
            console.error("Backend Error:", error);
            alert("Error merging PDFs. Check developer console.");
            // Reset UI
            startOverBtn.click();
        }
    });

    const showSuccessState = () => {
        const successState = document.getElementById('success-state');
        const dropzonesContainer = document.getElementById('dropzones-container');
        const actionContainer = document.getElementById('action-container');
        const successIcon = successState.querySelector('.success-icon');

        successState.classList.remove('hidden');

        const tl = gsap.timeline();
        
        tl.to(dropzonesContainer, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in", onComplete: () => {
              dropzonesContainer.style.display = 'none';
          }})
          .to(actionContainer, { opacity: 0, duration: 0.3, onComplete: () => {
              actionContainer.style.display = 'none';
          }}, "<")
          .to(successState, { opacity: 1, duration: 0.5, ease: "power2.out" })
          .fromTo(successIcon, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }, "-=0.2")
          .fromTo('#success-state h2, #success-state p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.5")
          .fromTo('.success-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.4");
    };

    // Start Over
    startOverBtn.addEventListener('click', () => {
        const successState = document.getElementById('success-state');
        const dropzonesContainer = document.getElementById('dropzones-container');
        const actionContainer = document.getElementById('action-container');
        const mergingIndicator = document.getElementById('merging-indicator');
        const progressBar = document.getElementById('progress-bar');
        
        // Reset states
        file1Path = null;
        file2Path = null;
        mergeBtn.setAttribute('disabled', 'true');
        mergeBtn.innerHTML = '<span>Merge PDFs</span><i class="fa-solid fa-wand-magic-sparkles"></i>';
        
        // Reset content UI
        const resetContent = (num) => {
            document.getElementById(`file-name-${num}`).innerHTML = `Choose PDF ${num}<br><small>or drag here</small>`;
            const contentDiv = document.getElementById(`content-${num}`);
            contentDiv.querySelector('.success-indicator').classList.add('hidden');
            const icon = contentDiv.querySelector('.drop-icon');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            icon.style.color = 'var(--text-secondary)';
        };
        resetContent(1);
        resetContent(2);

        // Reverse Animation back to Upload State
        const tl = gsap.timeline();
        
        tl.to(successState, { opacity: 0, duration: 0.4, ease: "power2.in", onComplete: () => {
            successState.classList.add('hidden');
            dropzonesContainer.style.display = 'flex';
            actionContainer.style.display = 'flex';
          }})
          .set(mergingIndicator, { opacity: 0, scale: 0.8 })
          .add(() => mergingIndicator.classList.add('hidden'))
          .set(progressBar, { width: '0%' })
          
          .set(dropzonesContainer, { scale: 1 })
          .set(dropzone1, { x: '0%', y: '0%', scale: 1, opacity: 1 })
          .set(dropzone2, { x: '0%', y: '0%', scale: 1, opacity: 1 })
          
          .to([dropzonesContainer, actionContainer], { opacity: 1, duration: 0.5, ease: "power2.out" })
          .to('#content-1, #content-2', { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.3")
          
          .set([dropzonesContainer, actionContainer, dropzone1, dropzone2, '#content-1', '#content-2'], { clearProps: "all" });
    });
});
