(() => {
    "use strict";

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Mobile navigation
    const hamburger = $("#hamburger");
    const navMenu = $("#navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const expanded = hamburger.getAttribute("aria-expanded") === "true";
            hamburger.setAttribute("aria-expanded", String(!expanded));
            hamburger.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
            navMenu.classList.toggle("active", !expanded);
        });

        $$(".nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.setAttribute("aria-label", "Open navigation");
                navMenu.classList.remove("active");
            });
        });
    }

    // Smooth scrolling with sticky-header offset
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", event => {
            const id = anchor.getAttribute("href");
            if (!id || id === "#") return;

            const target = $(id);
            if (!target) return;

            event.preventDefault();
            const header = $(".site-header");
            const offset = (header?.offsetHeight || 72) + 12;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    // Header elevation
    const header = $(".site-header");
    const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 20);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    // Contact form -> mailto (works on static GitHub Pages)
    const contactForm = $("#contactForm");
    contactForm?.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        window.location.href = `mailto:ashriansh5@gmail.com?subject=${subject}&body=${body}`;
    });

    // AI invoice browser-only simulator
    const dropZone = $("#dropZone");
    const fileInput = $("#fileInput");
    const simulateBtn = $("#simulateBtn");
    const statusText = $("#statusText");
    const spinner = $("#spinner");
    const extractedData = $("#extractedData");
    const flowSteps = $$(".flow-step");

    let selectedFile = null;

    const resetDropZone = () => {
        if (!dropZone) return;
        dropZone.classList.remove("has-file");
        dropZone.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <strong>Drop an invoice here</strong>
            <span>or click to browse · PDF, PNG, JPG</span>
            <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg">
        `;
        // Re-bind because the input was replaced.
        bindFileInput($("#fileInput"));
    };

    const showSelectedFile = file => {
        selectedFile = file;
        if (!dropZone) return;

        dropZone.classList.add("has-file");
        dropZone.innerHTML = `
            <i class="fa-solid fa-file-circle-check"></i>
            <strong>${escapeHtml(file.name)}</strong>
            <span>${formatBytes(file.size)} · ready to process</span>
            <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg">
        `;

        const newInput = $("#fileInput");
        if (newInput) {
            // Keep the selected file in JS state even though browsers do not allow
            // programmatically setting a new FileList.
            newInput.addEventListener("change", event => {
                if (event.target.files?.length) showSelectedFile(event.target.files[0]);
            });
        }

        if (statusText) statusText.textContent = "File ready. Start the simulation.";
    };

    const bindFileInput = input => {
        if (!input) return;
        input.addEventListener("change", event => {
            if (event.target.files?.length) showSelectedFile(event.target.files[0]);
        });
    };

    const escapeHtml = value =>
        String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        }[char]));

    const formatBytes = bytes => {
        if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    if (dropZone) {
        dropZone.addEventListener("click", event => {
            if (event.target?.id !== "fileInput") $("#fileInput")?.click();
        });

        dropZone.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                $("#fileInput")?.click();
            }
        });

        ["dragenter", "dragover"].forEach(type => {
            dropZone.addEventListener(type, event => {
                event.preventDefault();
                dropZone.classList.add("dragging");
            });
        });

        ["dragleave", "drop"].forEach(type => {
            dropZone.addEventListener(type, event => {
                event.preventDefault();
                dropZone.classList.remove("dragging");
            });
        });

        dropZone.addEventListener("drop", event => {
            const file = event.dataTransfer?.files?.[0];
            if (file) showSelectedFile(file);
        });

        bindFileInput(fileInput);
    }

    const setFlow = activeIndex => {
        flowSteps.forEach((step, index) => {
            step.classList.remove("active", "completed");
            if (index < activeIndex) step.classList.add("completed");
            if (index === activeIndex) step.classList.add("active");
        });
    };

    const finishFlow = () => {
        flowSteps.forEach(step => {
            step.classList.remove("active");
            step.classList.add("completed");
        });
    };

    simulateBtn?.addEventListener("click", () => {
        if (!selectedFile) {
            if (statusText) statusText.textContent = "Please upload an invoice first.";
            dropZone?.classList.add("error");
            setTimeout(() => dropZone?.classList.remove("error"), 700);
            return;
        }

        simulateBtn.disabled = true;
        if (spinner) spinner.hidden = false;
        if (extractedData) extractedData.hidden = true;

        setFlow(0);
        if (statusText) statusText.textContent = "Uploading invoice…";

        window.setTimeout(() => {
            setFlow(1);
            if (statusText) statusText.textContent = "AI extracting supplier and amount…";
        }, 900);

        window.setTimeout(() => {
            setFlow(2);
            if (statusText) statusText.textContent = "Applying BPM routing rules…";
        }, 2300);

        window.setTimeout(() => {
            setFlow(3);

            const scenarios = [
                ["TechCorp Inc.", "INV-10427", "$1,247.50", "Auto-approved"],
                ["Global Supplies", "INV-28731", "$6,832.00", "Pending manager"],
                ["Acme Solutions", "INV-39104", "$425.00", "Auto-approved"],
                ["Digital Dynamics", "INV-57218", "$12,500.00", "Needs review"]
            ];

            const row = scenarios[Math.floor(Math.random() * scenarios.length)];
            $("#extSupplier").textContent = row[0];
            $("#extInvoice").textContent = row[1];
            $("#extAmount").textContent = row[2];
            $("#extStatus").textContent = row[3];

            if (extractedData) extractedData.hidden = false;
            if (statusText) statusText.textContent = "Processing complete.";
            if (spinner) spinner.hidden = true;
            finishFlow();
            simulateBtn.disabled = false;
        }, 3600);
    });
})();
