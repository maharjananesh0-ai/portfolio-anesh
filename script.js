/* 
  Anesh Maharjan Portfolio - script.js
  Features:
  - Header scroll styling & Active navigation tracking
  - Mobile burger menu toggle
  - Scroll-reveal animations via Intersection Observer
  - Dynamic project portfolio grid with category filter
  - Skill meter animation triggers
  - Drag-and-drop file upload room with local preview integration
  - Interactive contact form validator with feedback state
*/

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. DYNAMIC PROJECTS DATABASE & RENDERING ---
  const defaultProjects = [
    {
      id: 1,
      name: 'Vanguard Corporate Plaza',
      location: 'Kathmandu, Nepal',
      area: '45,000 sq ft',
      description: 'A futuristic commercial tower containing modular workplaces, suspended glass lobbies, a high-efficiency curtain wall facade, and core concrete stabilization.',
      status: 'completed',
      category: 'commercial',
      image: 'images/project_commercial.png'
    },
    {
      id: 2,
      name: 'Imperial Height Villa',
      location: 'Lalitpur, Nepal',
      area: '8,200 sq ft',
      description: 'A luxury multi-level residential villa emphasizing raw board-formed concrete walls, structural steel framework, open timber decks, and panoramic solar energy integrations.',
      status: 'completed',
      category: 'residential',
      image: 'images/project_residential.png'
    },
    {
      id: 3,
      name: 'TechCorp Workspace Hub',
      location: 'Kathmandu, Nepal',
      area: '12,500 sq ft',
      description: 'Premium minimalist commercial interior fit-out project. Designed with acoustic timber paneling, structural metal structures, glass wall partitions, and smart MEP distribution.',
      status: 'completed',
      category: 'interiors',
      image: 'images/project_interior.png'
    },
    {
      id: 4,
      name: 'Skyline Residency Masterplan',
      location: 'Pokhara, Nepal',
      area: '120,000 sq ft',
      description: 'Ongoing site planning and scheduling coordination for a massive multi-block residential community. Features modern architectural silhouettes and earthwork balance planning.',
      status: 'ongoing',
      category: 'residential',
      image: 'images/project_blueprint.png'
    }
  ];

  // Load from session storage to retain mock uploads during page refreshes
  let projects = JSON.parse(sessionStorage.getItem('anesh_portfolio_projects')) || [...defaultProjects];

  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');

  function renderProjects(filter = 'all') {
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    const filteredProjects = filter === 'all' 
      ? projects 
      : projects.filter(p => p.category === filter);

    if (filteredProjects.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-cyan);"></i>
          <p>No projects found in this category.</p>
        </div>
      `;
      return;
    }

    filteredProjects.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = `project-card glass-panel reveal active`;
      card.style.animationDelay = `${index * 0.1}s`;

      const statusClass = project.status === 'completed' ? 'status-completed' : 'status-ongoing';
      const statusText = project.status === 'completed' ? 'Completed' : 'Ongoing';

      card.innerHTML = `
        <div class="project-img-wrapper">
          <img src="${project.image}" alt="${project.name}" class="project-img" onerror="this.src='images/project_blueprint.png'">
          <span class="project-status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="project-details">
          <h3 class="project-name">${project.name}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-specs">
            <div class="spec-item">
              <span class="spec-label">Location</span>
              <span class="spec-val">${project.location}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Area</span>
              <span class="spec-val">${project.area}</span>
            </div>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  // Set up filter buttons event listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      renderProjects(filterValue);
    });
  });

  // Initial render
  renderProjects();


  // --- 2. HEADER SCROLL & NAVIGATION ---
  const header = document.querySelector('header');
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Sticky header class injection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Nav active link tracking on scroll
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu burger toggler
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }


  // --- 3. SCROLL REVEAL ANIMATION SYSTEM ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Trigger skill bars loading when the skill list container reveals
        if (entry.target.id === 'skills-list') {
          triggerSkillBars();
        }
        
        // Unobserve once shown
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(elem => {
    revealObserver.observe(elem);
  });


  // --- 4. SKILLS METER ANIMATION ---
  function triggerSkillBars() {
    const percentages = document.querySelectorAll('.skill-percentage');
    const fills = document.querySelectorAll('.skill-bar-fill');

    percentages.forEach((perc, idx) => {
      const targetVal = parseInt(perc.getAttribute('data-val'));
      let currentVal = 0;
      
      // Animate percentage text count-up
      const interval = setInterval(() => {
        if (currentVal >= targetVal) {
          clearInterval(interval);
        } else {
          currentVal++;
          perc.innerText = `${currentVal}%`;
        }
      }, 15);

      // Animate fill bar width
      if (fills[idx]) {
        fills[idx].style.width = `${targetVal}%`;
      }
    });
  }


  // --- 5. DRAG AND DROP MOCK UPLOAD ROOM ---
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const uploadStatusWrapper = document.getElementById('upload-status-wrapper');
  const uploadedFilesList = document.getElementById('uploaded-files-list');

  if (uploadZone && fileInput) {
    // Click zone triggers file selection
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });

    // Prevent defaults on drag states
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Add drag state styles
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('dragging');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('dragging');
      }, false);
    });

    // Drop file handler
    uploadZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    function handleFiles(files) {
      if (files.length === 0) return;
      
      uploadStatusWrapper.style.display = 'block';

      Array.from(files).forEach(file => {
        processUploadedFile(file);
      });
    }

    function processUploadedFile(file) {
      // 1. Create status card
      const fileId = 'file_' + Date.now() + '_' + Math.floor(Math.random()*1000);
      const card = document.createElement('div');
      card.className = 'uploaded-file-card glass-panel';
      card.id = fileId;

      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeStr = sizeKB > 1000 ? `${(sizeKB/1024).toFixed(1)} MB` : `${sizeKB} KB`;

      // Determine icon
      let fileIcon = '<i class="fa-solid fa-file-code file-meta-icon"></i>';
      if (file.type.startsWith('image/')) {
        fileIcon = '<i class="fa-solid fa-file-image file-meta-icon"></i>';
      } else if (file.type === 'application/pdf') {
        fileIcon = '<i class="fa-solid fa-file-pdf file-meta-icon"></i>';
      } else if (file.name.endsWith('.dwg') || file.name.endsWith('.dxf')) {
        fileIcon = '<i class="fa-solid fa-drafting-compass file-meta-icon"></i>';
      } else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
        fileIcon = '<i class="fa-solid fa-file-zipper file-meta-icon"></i>';
      }

      card.innerHTML = `
        <div style="width: 100%;">
          <div class="file-details">
            ${fileIcon}
            <div>
              <span class="file-name" title="${file.name}">${file.name}</span>
              <span class="file-size">(${sizeStr})</span>
            </div>
            <div class="file-status-indicator" id="status_text_${fileId}" style="margin-left: auto; color: var(--accent-cyan);">
              Uploading...
            </div>
          </div>
          <div class="file-progress-bar">
            <div class="file-progress-fill" id="progress_fill_${fileId}"></div>
          </div>
        </div>
      `;
      uploadedFilesList.appendChild(card);

      // 2. Animate Upload Progress (Simulation)
      let progress = 0;
      const progressFill = document.getElementById(`progress_fill_${fileId}`);
      const statusText = document.getElementById(`status_text_${fileId}`);

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 25) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          progressFill.style.backgroundColor = '#10b981';
          statusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Loaded';
          statusText.style.color = '#10b981';

          // 3. Inject image into projects gallery in real time
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const base64Img = e.target.result;
              const newProject = {
                id: Date.now(),
                name: file.name.split('.')[0].replace(/[-_]/g, ' '),
                location: 'Site Upload Room',
                area: 'Session Render',
                description: `Custom architecture blueprint mockup uploaded directly to session gallery on ${new Date().toLocaleDateString()}.`,
                status: 'ongoing',
                category: 'interiors', // Default to interiors category
                image: base64Img
              };
              
              // Prepend to project list
              projects.unshift(newProject);
              
              // Keep it in session storage
              sessionStorage.setItem('anesh_portfolio_projects', JSON.stringify(projects));
              
              // Re-render
              const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
              renderProjects(activeFilter);

              // Flash highlight on projects section
              const projSection = document.getElementById('projects');
              if (projSection) {
                projSection.scrollIntoView({ behavior: 'smooth' });
              }
            };
            reader.readAsDataURL(file);
          }
        }
        progressFill.style.width = `${progress}%`;
      }, 150);
    }
  }


  // --- 6. INTERACTIVE CONTACT FORM ---
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('btn-submit-form');
      const originalText = submitBtn.innerText;
      
      // Visual submitting state
      submitBtn.innerText = 'Transmitting Data...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      // Simulate network request
      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';

        // Clear feedback styling classes
        formFeedback.className = 'form-feedback';
        
        // Set success feedback
        formFeedback.classList.add('success');
        formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connection established. Message received! Anesh will review your specifications shortly.';
        
        // Reset form input elements
        contactForm.reset();

        // Autoclose status after 6 seconds
        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 6000);
      }, 1500);
    });
  }

});
