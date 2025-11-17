// Animated Background with Particles
class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 10000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 3
        );
        
        gradient.addColorStop(0, `rgba(255, 0, 79, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(112, 0, 255, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    connectParticles(particle, index) {
        for (let i = index + 1; i < this.particles.length; i++) {
            const other = this.particles[i];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(other.x, other.y);
                const opacity = (1 - distance / 120) * 0.3;
                this.ctx.strokeStyle = `rgba(255, 0, 79, ${opacity})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
            }
        }
    }
    
    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Mouse interaction with slight randomness
        const dx = this.mousePosition.x - particle.x;
        const dy = this.mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const force = (150 - distance) / 150;
            const randomFactor = 1.8 + Math.random() * 0.4; // Varies between 1.8 and 2.2
            particle.x -= (dx / distance) * force * randomFactor;
            particle.y -= (dy / distance) * force * randomFactor;
        }
        
        // Boundary check
        if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        
        // Keep particles within bounds
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw glow effect
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.canvas.height / 2
        );
        gradient.addColorStop(0, 'rgba(255, 0, 79, 0.03)');
        gradient.addColorStop(0.5, 'rgba(112, 0, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(10, 10, 15, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            this.updateParticle(particle);
            this.drawParticle(particle);
            this.connectParticles(particle, index);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Background Music Control
function initMusicControl() {
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const icon = musicToggle.querySelector('i');
    let isPlaying = false;

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            music.pause();
            icon.className = 'fas fa-volume-mute';
            musicToggle.classList.remove('playing');
            musicToggle.title = 'Play Music';
        } else {
            music.play().catch(e => console.log('Audio play failed:', e));
            icon.className = 'fas fa-volume-up';
            musicToggle.classList.add('playing');
            musicToggle.title = 'Mute Music';
        }
        isPlaying = !isPlaying;
    });

    // Try to play on first user interaction
    document.addEventListener('click', function playOnFirstClick() {
        if (!isPlaying) {
            music.play().then(() => {
                isPlaying = true;
                icon.className = 'fas fa-volume-up';
                musicToggle.classList.add('playing');
                musicToggle.title = 'Mute Music';
            }).catch(e => console.log('Auto-play prevented'));
        }
        document.removeEventListener('click', playOnFirstClick);
    }, { once: true });
}

// Dynamic Role Typewriter Effect
function initRoleTypewriter() {
    const roles = [
        'AI Agent Builder',
        'Python Developer',
        'Desktop App Developer',
        'Automation Specialist'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const roleElement = document.getElementById('dynamic-role');
    const typingSpeed = 85;
    const deletingSpeed = 42;
    const pauseAtEnd = 2400;
    const pauseAfterDelete = 750;
    
    function type() {
        if (!roleElement) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
            roleElement.textContent = currentRole.substring(0, charIndex);
        } else {
            charIndex++;
            roleElement.textContent = currentRole.substring(0, charIndex);
        }
        
        // Add slight randomness to typing speed
        let speed = isDeleting ? deletingSpeed : typingSpeed;
        speed += Math.random() * 15 - 7; // Random variation of ±7ms
        
        if (!isDeleting && charIndex === currentRole.length) {
            speed = pauseAtEnd;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = pauseAfterDelete;
        }
        
        setTimeout(type, speed);
    }
    
    type();
}

// Mobile Navigation Toggle
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Smooth Scroll with offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// Animate skill bars on scroll
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                bar.style.animation = 'progressAnimation 1.5s ease forwards';
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 600;
    }
});

// Project card hover effect
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Cursor glow effect
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 0, 79, 0.15), transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 9999;
    mix-blend-mode: screen;
    transition: opacity 0.3s ease;
    opacity: 0;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}
// Xperiment Modal Content
const xperimentData = {
    xperiment1: {
        title: 'Tool Calling Agent - Zero Assistant',
        description: 'Analysis of the Tool Calling Agent\'s behavior, capabilities, and performance across different Gemini models.',
        fullContent: `
            <h2>Tool Calling Agent - Zero Assistant</h2>
            <div class="modal-tags">
                <span>Zero Assistant</span>
                <span>AI Agents</span>
                <span>Tool Calling</span>
                <span>Gemini</span>
            </div>
            
            <h3>1. Introduction</h3>
            <p>The Tool Calling Agent is a core execution module inside the Zero Assistant system. Its primary function is to determine whether a user query requires a tool and, if so, execute the appropriate tool.</p>
            <p>Unlike Zero's reasoning or conversational components, this agent does not perform logical interpretation or long-term planning. Its focus is strictly on tool invocation and task execution.</p>
            <p>This experiment evaluates the behavior, capabilities, and test results of the Tool Calling Agent inside Zero.</p>
            
            <h3>2. Objective</h3>
            <ul>
                <li>To analyze whether an LLM can detect when a query requires external tools</li>
                <li>To evaluate how accurately the LLM selects and calls tools</li>
                <li>To test the LLM's performance across different model variants</li>
                <li>To identify constraints and ideal use cases of tool-calling</li>
            </ul>
            
            <h3>3. Where a Tool-Calling LLM Can Be Used</h3>
            <p>A tool-enabled LLM can be applied in tasks involving external actions such as:</p>
            <ul>
                <li>Automation tasks</li>
                <li>Data fetching or transformation</li>
                <li>Search and retrieval</li>
                <li>Code execution or debugging</li>
                <li>API and system integrations</li>
            </ul>
            <p>These are scenarios where the LLM must <strong>"do something"</strong> rather than only <strong>"say something."</strong></p>
            
            <h3>4. Where a Tool-Calling LLM Cannot Be Used</h3>
            <p>This agent-style LLM is not suitable for:</p>
            <ul>
                <li>Multi-step deep reasoning</li>
                <li>Strategic or long-term planning</li>
                <li>Knowledge-intensive inference</li>
                <li>Emotional or conversational use cases</li>
                <li>Multi-agent coordination</li>
            </ul>
            <p><strong>Tool-calling does not provide intelligence itself; it only gives execution ability.</strong></p>
            
            <h3>5. Limitations Observed</h3>
            <ul>
                <li>No deep reasoning ability</li>
                <li>Limited contextual awareness</li>
                <li>Heavy dependency on external tools</li>
                <li>No learning or memory capability</li>
                <li>Cannot operate autonomously</li>
            </ul>
            <p><strong>The LLM only decides when and which tool to use — nothing more.</strong></p>
            
            <h3>6. Experiment Setup</h3>
            <h4>Prompt Used</h4>
            <p><strong>"Deep research to find the best tutorial in easy English language."</strong></p>
            
            <h4>LLM Variants Tested</h4>
            <ul>
                <li>Gemini 2.0 Flash Lite</li>
                <li>Gemini 2.0 Flash</li>
                <li>Gemini 2.5 Flash Lite</li>
                <li>Gemini 2.5 Flash</li>
                <li>Gemini 2.5 Pro</li>
            </ul>
            
            <h4>Temperature: 0.7</h4>
            <p>Used to allow flexible reasoning while keeping responses stable.</p>
            
            <h4>Tools Available</h4>
            <ul>
                <li>youtube_advanced_search</li>
                <li>youtube_transcript</li>
            </ul>
            
            <h3>7. Observations</h3>
            <p><strong>Tool Detection</strong><br>
            The LLM accurately identified that the query required YouTube search and transcript tools.</p>
            
            <p><strong>Model Variance</strong><br>
            Different model sizes produced noticeably different outputs.</p>
            
            <p><strong>Adaptive Tool Usage</strong><br>
            The LLM executed tools only when required, showing correct use-case understanding.</p>
            
            <h3>8. Key Insights</h3>
            <h4>1. Tool Dependency</h4>
            <p>The best results were obtained when the LLM used both:</p>
            <ul>
                <li>advanced YouTube search</li>
                <li>transcript extraction</li>
            </ul>
            <p>Together, they provided accurate research results.</p>
            
            <h4>2. Best Model</h4>
            <p><strong>Gemini 2.0 Flash</strong> delivered the most consistent, balanced, and reliable tool-calling behavior.</p>
            
            <h4>3. Execution Efficiency</h4>
            <p>The LLM effectively handled tool invocation without unnecessary calls.</p>
            
            <h4>4. Output Clarity</h4>
            <p>All outputs included structured information, metadata, and easy-to-understand reasoning.</p>
            
            <h3>9. Conclusion</h3>
            <p>This experiment demonstrates that a standard LLM can be converted into an action-capable agent by enabling tool-calling.</p>
            <p>While it lacks reasoning depth and autonomy, its execution ability makes it suitable for practical tasks such as research, automation, and data retrieval.</p>
            
            <p><strong>Among tested models, Gemini 2.0 Flash performed best in accuracy and tool-calling reliability.</strong></p>
        `
    },
    xperiment2: {
        title: 'Real-Time Speech Recognition + LLM Enhancement Engine',
        fullContent: `
            <h2>ZERO Assistant – Experimental Report</h2>
            <h3 style="text-align: center; margin-bottom: 2rem;">Real-Time Speech Recognition + LLM Enhancement Engine (Prototype v1)</h3>
            <div class="modal-tags">
                <span>ZERO Assistant</span>
                <span>Speech Recognition</span>
                <span>LLM Enhancement</span>
                <span>Voice AI</span>
                <span>Hinglish</span>
            </div>
            
            <h3>1. Overview</h3>
            <p>ZERO Assistant is running an ongoing experiment to build a real-time voice understanding engine—something that listens continuously, understands speech instantly, and cleans up the meaning using an LLM.</p>
            
            <p>This experiment explores:</p>
            <ul>
                <li>Real-time background speech recognition</li>
                <li>Combining raw STT with LLM correction</li>
                <li>Improving accuracy for Hinglish, Hindi, and English</li>
                <li>Making ZERO respond like a natural voice assistant</li>
            </ul>
            
            <p><strong>The core engine behind this experiment is the ZERO Speech Recognition Tool.</strong></p>
            
            <h3>2. Objective of Experiment</h3>
            <p>The main goal is to test whether ZERO can:</p>
            <ul>
                <li>Hear continuously in the background</li>
                <li>Understand noisy or unclear speech</li>
                <li>Correct it automatically using AI (LLM)</li>
                <li>Preserve language tone (Hindi/Hinglish/English)</li>
                <li>Operate like an offline/online hybrid voice assistant</li>
            </ul>
            
            <p><strong>Basically — can ZERO become the "ears" of your JIM-powered assistant?</strong></p>
            
            <h3>3. Experiment System Architecture</h3>
            <pre style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 10px; overflow-x: auto; line-height: 1.8;">
User Speech → Microphone → ZERO Listener Thread
        ↓
Google Speech-to-Text (Raw Recognition)
        ↓
LLM Enhancement (Gemini / Groq / GPT / Ollama)
        ↓
Final Cleaned Text → ZERO Brain (Commands, Actions)
            </pre>
            
            <p><strong>Key Components:</strong></p>
            <ul>
                <li>Background Listener Thread</li>
                <li>Silence Detection Engine</li>
                <li>Global Text Memory (RECOGNIZED_TEXT)</li>
                <li>LLM Accuracy Booster</li>
                <li>Thread-Safe Access Layer</li>
            </ul>
            
            <p>This pipeline makes ZERO capable of listening + understanding without stopping the main program.</p>
            
            <h3>4. Experimental Features</h3>
            
            <h4>A. Real-Time Background Listening</h4>
            <p>ZERO listens continuously without blocking your application.</p>
            
            <h4>B. LLM Correction Layer</h4>
            <p>Raw transcription is often messy. ZERO uses an LLM to:</p>
            <ul>
                <li>Fix grammar</li>
                <li>Correct misheard words</li>
                <li>Preserve Hindi/Hinglish</li>
                <li>Infer missing meaning</li>
                <li>Rebuild incomplete sentences</li>
            </ul>
            
            <h4>C. Non-Blocking Architecture</h4>
            <p>ZERO keeps listening while your main app executes commands.</p>
            
            <h4>D. Multi-Language Strength</h4>
            <p>Especially powerful in:</p>
            <ul>
                <li>Hindi</li>
                <li>Hinglish</li>
                <li>English (India / US)</li>
            </ul>
            
            <h3>5. Experiment Setup</h3>
            
            <h4>Configuration Used</h4>
            <ul>
                <li>SpeechRecognition + PyAudio</li>
                <li>LLM: Gemini 2.0 Flash OR Groq Llama 3</li>
                <li>Language: hi-IN or en-US</li>
                <li>Pause Threshold: 1.5 sec</li>
                <li>Dynamic Energy Threshold enabled</li>
            </ul>
            
            <h4>Hardware</h4>
            <ul>
                <li>Standard laptop microphone</li>
                <li>Low-noise room</li>
            </ul>
            
            <h4>Software</h4>
            <ul>
                <li>ZERO Assistant Core</li>
                <li>Codemni Autonomous Tool Framework</li>
                <li>Python 3.10+</li>
            </ul>
            
            <h3>6. Experiment Procedure</h3>
            <ol>
                <li>ZERO starts its background listener thread.</li>
                <li>User speaks normally (Hindi/Hinglish/English mix).</li>
                <li>Audio converts to raw text via Google STT.</li>
                <li>ZERO sends raw text to the LLM.</li>
                <li>LLM returns a "clean, corrected, meaning-preserved" sentence.</li>
                <li>ZERO stores it in global memory (RECOGNIZED_TEXT).</li>
                <li>ZERO's command engine reads it and triggers relevant actions.</li>
            </ol>
            
            <h3>7. Results</h3>
            
            <h4>Accuracy</h4>
            <ul>
                <li><strong>Without LLM:</strong> 70–80%</li>
                <li><strong>With LLM:</strong> 92–97%</li>
            </ul>
            
            <h4>Latency</h4>
            <ul>
                <li><strong>No LLM:</strong> ~150–200 ms</li>
                <li><strong>With LLM (Groq/Gemini):</strong> ~350–600 ms</li>
            </ul>
            
            <h4>Language Performance</h4>
            <ul>
                <li><strong>Hinglish:</strong> Excellent</li>
                <li><strong>Hindi:</strong> Excellent</li>
                <li><strong>English:</strong> Excellent</li>
            </ul>
            
            <h4>Clarity Improvement Example</h4>
            <pre style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 10px; overflow-x: auto; line-height: 1.8;">
Raw STT → "jim ka open kar"
LLM Enhanced → "JIM ko open karo"

RAW → "mere ko time bata"
LLM Enhanced → "Mujhe time bata do"
            </pre>
            
            <h3>8. Conclusion</h3>
            <p>The experiment shows that ZERO can:</p>
            <ul>
                <li>Listen continuously</li>
                <li>Understand speech reliably</li>
                <li>Clean up messy input using AI</li>
                <li>Handle Hinglish like a real human</li>
                <li>Act as a natural voice-first assistant</li>
                <li>Work as the first core module of the upcoming JIM engine</li>
            </ul>
            
            <p><strong>ZERO's speech layer is now stable enough to be integrated into:</strong></p>
            <ul>
                <li>Home automation</li>
                <li>Desktop assistants</li>
                <li>AI agents</li>
                <li>Command-based tools</li>
                <li>Companion AIs</li>
            </ul>
        `
    }
};

// Open Xperiment Modal
function openXperimentModal(xperimentId) {
    const modal = document.getElementById('xperimentModal');
    const modalBody = document.getElementById('modalBody');
    const data = xperimentData[xperimentId];
    
    if (data) {
        modalBody.innerHTML = data.fullContent;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close Xperiment Modal
function closeXperimentModal() {
    const modal = document.getElementById('xperimentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeXperimentModal();
        closeBlogModal();
    }
});

// Blog Modal Content
const blogData = {
    blog1: {
        title: 'How to Convert an LLM Into an Agent (Complete Guide + Example Code)',
        category: 'AI Development',
        date: 'November 16, 2025',
        readTime: '12 min read',
        content: `
            <div class="blog-hero">
                <span class="blog-category">AI Development</span>
                <span class="blog-date">November 16, 2025 • 12 min read</span>
            </div>
            <h1>How to Convert an LLM Into an Agent (Complete Guide + Example Code)</h1>
            <div class="modal-tags">
                <span>AI Agents</span>
                <span>Tool Calling</span>
                <span>LLM</span>
                <span>Python</span>
                <span>Tutorial</span>
            </div>
            
            <div class="blog-intro-card">
                <p>Large Language Models (LLMs) are amazing at generating text — but on their own, they can't <strong>act</strong>. They can't fetch data, run calculations, call APIs, read files, or perform tasks in the real world.</p>
                
                <p>To make them useful in automation, research, and engineering workflows, we need to convert an LLM into an <strong>intelligent agent</strong>.</p>
            </div>
            
            <div class="learning-objectives">
                <h3>What You'll Learn</h3>
                <div class="objectives-grid">
                    <div class="objective-item">What makes an LLM different from an agent</div>
                    <div class="objective-item">How tool-calling transforms model abilities</div>
                    <div class="objective-item">Build a working agent from scratch</div>
                    <div class="objective-item">Understand the execution loop</div>
                    <div class="objective-item">Get complete code examples</div>
                    <div class="objective-item">Extend with your own tools</div>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">LLM vs Agent: The Key Difference</h2>
                
                <div class="comparison-cards">
                    <div class="comparison-card llm-card">
                        <h4>Standard LLM</h4>
                        <p>Only produces <strong>text responses</strong></p>
                        <ul class="simple-list">
                            <li>Reads input</li>
                            <li>Generates text</li>
                            <li>Cannot take action</li>
                            <li>No real-world interaction</li>
                        </ul>
                    </div>
                    
                    <div class="comparison-card agent-card">
                        <h4>Intelligent Agent</h4>
                        <p>Can <strong>think and act</strong> in the world</p>
                        <ul class="simple-list">
                            <li><strong>Decides</strong> when tools are needed</li>
                            <li><strong>Chooses</strong> the right tool to call</li>
                            <li><strong>Executes</strong> actions with parameters</li>
                            <li><strong>Processes</strong> results and continues</li>
                            <li><strong>Delivers</strong> comprehensive answers</li>
                        </ul>
                    </div>
                </div>
                
                <div class="insight-box">
                    <p><strong>Key Insight:</strong> An agent transforms your LLM from a passive text generator into an active AI program that can interact with APIs, databases, files, and the real world.</p>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">The Power of Tool Calling</h2>
                
                <p class="section-intro">Tool calling is the magic that transforms passive LLMs into active agents. Instead of just generating text, the model can invoke external functions to gather data, perform calculations, and take real actions.</p>
                
                <div class="tools-showcase">
                    <h4>Example Tools You Can Add</h4>
                    <div class="tools-grid">
                        <div class="tool-item">
                            <strong>Calculator</strong>
                            <small>Mathematical operations</small>
                        </div>
                        <div class="tool-item">
                            <strong>Weather API</strong>
                            <small>Real-time weather data</small>
                        </div>
                        <div class="tool-item">
                            <strong>File Reader</strong>
                            <small>Process documents</small>
                        </div>
                        <div class="tool-item">
                            <strong>Search Engine</strong>
                            <small>Find information online</small>
                        </div>
                        <div class="tool-item">
                            <strong>Database</strong>
                            <small>Query structured data</small>
                        </div>
                        <div class="tool-item">
                            <strong>Python Functions</strong>
                            <small>Execute custom code</small>
                        </div>
                    </div>
                </div>
                
                <div class="highlight-box">
                    <p><strong>The Goal:</strong> When your LLM can intelligently choose and trigger the right tool at the right time, it becomes a true <strong>action-driven agent</strong>.</p>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">Building Your Agent (5 Steps)</h2>
                
                <p class="section-intro">Let's build a complete working agent from scratch. This follows the same architecture used by frameworks like LangChain, AutoGPT, and Microsoft Autogen.</p>
                
                <div class="build-steps">
                    <div class="step-card">
                        <div class="step-header">
                            <span class="step-number">1</span>
                            <h3>Define Your Tools</h3>
                        </div>
                        
                        <p class="step-description">Tools are Python functions that give your agent new capabilities. Each tool should be simple, focused, and well-documented.</p>
                        
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">Python</span>
                                <span class="code-title">tools.py</span>
                            </div>
                            <pre><code>def calculator(expression: str) -> str:
    """Evaluate mathematical expressions safely"""
    try:
        result = eval(expression)
        return f"Result: {result}"
    except Exception as e:
        return f"Error: {str(e)}"

def get_weather(city: str) -> str:
    """Get current weather for any city"""
    # In real implementation, call actual weather API
    return f"Weather in {city}: Sunny, 26°C, Light breeze"</code></pre>
                        </div>
                    </div>
            
                    <div class="step-card">
                        <div class="step-header">
                            <span class="step-number">2</span>
                            <h3>Create the System Prompt</h3>
                        </div>
                        
                        <p class="step-description">The system prompt controls how your LLM behaves. We force it to respond in structured JSON so we can parse its decisions programmatically.</p>
                        
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">Prompt</span>
                                <span class="code-title">agent_prompt.txt</span>
                            </div>
                            <pre><code>You are an intelligent Tool-Calling Agent.

RESPONSE FORMAT (JSON only):
{
  "thought": "Your reasoning process",
  "tool_call": "tool_name_or_null",
  "tool_params": {...} or null,
  "final_answer": "response_or_null"
}

📋 RULES:
• If you need a tool → set tool_call + tool_params
• If waiting for results → set final_answer: null
• When done → set tool_call: null + final_answer
• Always explain your thought process</code></pre>
                        </div>
                        
                        <div class="pro-tip">
                            <p><strong>Pro Tip:</strong> The structured format ensures consistent, machine-readable responses that your code can reliably parse.</p>
                        </div>
                    </div>
            
                    <div class="step-card">
                        <div class="step-header">
                            <span class="step-number">3</span>
                            <h3>Build the JSON Parser</h3>
                        </div>
                        
                        <p class="step-description">Extract and parse the JSON block from the LLM's response to understand its decisions.</p>
                        
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">Python</span>
                                <span class="code-title">parser.py</span>
                            </div>
                            <pre><code>import json
import re

def parse_agent_json(response: str) -> dict:
    """Extract JSON from LLM response text"""
    # Find JSON block in response
    match = re.search(r"json block pattern", response, re.DOTALL)
    
    if not match:
        raise ValueError("No JSON found in model output!")
    
    # Parse and return structured data
    return json.loads(match.group(1))</code></pre>
                        </div>
                    </div>
            
                    <div class="step-card">
                        <div class="step-header">
                            <span class="step-number">4</span>
                            <h3>Create Tool Execution Router</h3>
                        </div>
                        
                        <p class="step-description">Build a registry that maps tool names to actual Python functions and executes them safely.</p>
                        
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">Python</span>
                                <span class="code-title">executor.py</span>
                            </div>
                            <pre><code># Tool Registry - Maps names to functions
TOOLS = {
    "calculator": calculator,
    "get_weather": get_weather,
}

def execute_tool(tool_name: str, params: dict) -> str:
    """Execute the requested tool with parameters"""
    tool_fn = TOOLS.get(tool_name)
    
    if not tool_fn:
        return f"Error: Unknown tool '{tool_name}'"
    
    try:
        return tool_fn(**params)
    except Exception as e:
        return f"Tool execution failed: {str(e)}"</code></pre>
                        </div>
                        
                        <div class="pro-tip">
                            <p><strong>Pro Tip:</strong> Add error handling to prevent tool failures from crashing your agent.</p>
                        </div>
                    </div>
            
                    <div class="step-card">
                        <div class="step-header">
                            <span class="step-number">5</span>
                            <h3>♻️ Implement the Agent Loop</h3>
                        </div>
                        
                        <p class="step-description">The execution engine - this is where the magic happens. The LLM reasons, calls tools, processes results, and continues until completion.</p>
                        
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">Python</span>
                                <span class="code-title">agent.py</span>
                            </div>
                            <pre><code>def agent_run(llm, user_query: str, max_iterations: int = 10):
    """Main agent execution loop"""
    prompt = AGENT_PROMPT + f"\n\nUser Query: {user_query}"
    history = []
    
    for iteration in range(max_iterations):
        # Get LLM response
        response = llm(prompt)
        parsed = parse_agent_json(response)
        
        # Extract decisions
        tool = parsed.get("tool_call")
        params = parsed.get("tool_params")
        final_answer = parsed.get("final_answer")
        
        # Check if agent is done
        if tool is None:
            return final_answer
        
        # Execute tool and get result
        tool_result = execute_tool(tool, params)
        
        # Add result to prompt for next iteration
        prompt += f"\n\nTool Result: {tool_result}"
        history.append({"tool": tool, "result": tool_result})
    
    return "Error: Maximum iterations reached"</code></pre>
                        </div>
                        
                        <div class="highlight-box">
                            <p><strong>This is the core pattern:</strong> Think → Act → Observe → Repeat. This is exactly how frameworks like LangChain, AutoGPT, and CrewAI work internally.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">🎬 Live Example: Agent in Action</h2>
                
                <p class="section-intro">Let's watch the agent handle a real multi-step query that requires multiple tool calls. This demonstrates the full think-act-observe cycle.</p>
                
                <div class="example-query">
                    <h4>💬 User Query</h4>
                    <blockquote>"What's 25 * 4 and what's the weather in Paris?"</blockquote>
                </div>
                
                <div class="agent-execution">
                    <div class="iteration-step">
                        <div class="iteration-header">
                            <span class="iteration-badge">Iteration 1</span>
                            <span class="iteration-status thinking">🤔 Thinking</span>
                        </div>
                        <p><strong>LLM Decision:</strong> Identifies two tasks. Handles math first.</p>
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">JSON</span>
                                <span class="code-title">LLM Output</span>
                            </div>
                            <pre><code>{
  "thought": "Need to calculate 25 * 4 first",
  "tool_call": "calculator",
  "tool_params": {"expression": "25 * 4"},
  "final_answer": null
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="iteration-step">
                        <div class="iteration-header">
                            <span class="iteration-badge">Iteration 2</span>
                            <span class="iteration-status acting">Executing</span>
                        </div>
                        <p><strong>Tool Result:</strong> Calculator returns <code>100</code></p>
                        <p>Now the agent moves to the weather query:</p>
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">JSON</span>
                                <span class="code-title">LLM Output</span>
                            </div>
                            <pre><code>{
  "thought": "Got math result. Now fetching Paris weather",
  "tool_call": "get_weather",
  "tool_params": {"city": "Paris"},
  "final_answer": null
}</code></pre>
                        </div>
                    </div>
                    
                    <div class="iteration-step">
                        <div class="iteration-header">
                            <span class="iteration-badge">Iteration 3</span>
                            <span class="iteration-status complete">✅ Completing</span>
                        </div>
                        <p><strong>Tool Result:</strong> Weather API returns <code>"Sunny, 26°C, Light breeze"</code></p>
                        <p>Agent has all information. Compiling final answer:</p>
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-lang">JSON</span>
                                <span class="code-title">Final Response</span>
                            </div>
                            <pre><code>{
  "thought": "Have both results, composing answer",
  "tool_call": null,
  "tool_params": null,
  "final_answer": "25 * 4 = 100. The weather in Paris is Sunny, 26°C with a light breeze."
}</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="insight-box">
                    <p><strong>Key Insight:</strong> The agent autonomously broke down a complex query, executed tools in sequence, and synthesized a complete answer. This is the power of agentic AI.</p>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">🏗️ Why This Architecture Works</h2>
                
                <p class="section-intro">A successful agent needs six core components working together. Each piece plays a critical role in transforming text generation into intelligent action.</p>
                
                <div class="architecture-table">
                    <div class="modal-tags" style="margin-bottom: 1.5rem;">
                        <span>Architecture</span>
                        <span>Components</span>
                        <span>Design Pattern</span>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Purpose</th>
                                <th>Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>System Prompt</strong></td>
                                <td>Controls LLM behavior</td>
                                <td>Forces structured thinking</td>
                            </tr>
                            <tr>
                                <td><strong>JSON Schema</strong></td>
                                <td>Standardizes output format</td>
                                <td>Machine-readable decisions</td>
                            </tr>
                            <tr>
                                <td><strong>Parser</strong></td>
                                <td>Extracts tool calls</td>
                                <td>Converts text to actions</td>
                            </tr>
                            <tr>
                                <td><strong>Tool Registry</strong></td>
                                <td>Maps names to functions</td>
                                <td>Adds new capabilities</td>
                            </tr>
                            <tr>
                                <td><strong>Execution Loop</strong></td>
                                <td>Iterative reasoning</td>
                                <td>Multi-step problem solving</td>
                            </tr>
                            <tr>
                                <td><strong>External Tools</strong></td>
                                <td>Real-world actions</td>
                                <td>Bridges AI to reality</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="capabilities-showcase">
                    <h4>What Your Agent Can Do</h4>
                    <div class="capabilities-grid">
                        <div class="capability-item">Perform calculations</div>
                        <div class="capability-item">Search the web</div>
                        <div class="capability-item">Query databases</div>
                        <div class="capability-item">Process files</div>
                        <div class="capability-item">Call APIs</div>
                        <div class="capability-item">Automate workflows</div>
                        <div class="capability-item">Chain complex tasks</div>
                        <div class="capability-item">Execute custom code</div>
                    </div>
                </div>
                
                <div class="highlight-box">
                    <p><strong>Bottom Line:</strong> This architecture is the foundation of modern AI systems — from automation agents and research assistants to dev tools and workflow engines.</p>
                </div>
            </div>
            
            <div class="section-divider"></div>
            
            <div class="content-section">
                <h2 class="section-title">Key Takeaways</h2>
                
                <div class="takeaways-intro">
                    <p>Transforming an LLM into an agent is one of the most powerful upgrades you can make to any AI system. Here's what you gain:</p>
                </div>
                
                <div class="benefits-cards">
                    <div class="benefit-card">
                        <div class="benefit-icon">1</div>
                        <h4>Actionable AI</h4>
                        <p>Your LLM can now execute real-world tasks, not just generate text responses.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">2</div>
                        <h4>True Automation</h4>
                        <p>Complex multi-step workflows run autonomously with intelligent decision-making.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">3</div>
                        <h4>Enhanced Intelligence</h4>
                        <p>Multi-step reasoning powered by external data and real-time information.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">4</div>
                        <h4>Infinite Extensibility</h4>
                        <p>Add any tool and instantly gain zero-shot capabilities in new domains.</p>
                    </div>
                </div>
                
                <div class="final-message">
                    <h3>Ready to Build?</h3>
                    <p>You now have the complete blueprint for building intelligent agents. Start with the basic calculator and weather tools from this guide, then expand infinitely:</p>
                    <ul class="expansion-ideas">
                        <li>Add web scrapers for data collection</li>
                        <li>Connect database systems for persistent storage</li>
                        <li>Integrate file processors for document analysis</li>
                        <li>Wire up API endpoints for external services</li>
                        <li>Build custom tools for your specific use case</li>
                    </ul>
                    <p><strong>The possibilities are endless.</strong> Every tool you add gives your agent a new superpower.</p>
                </div>
                
                <div class="cta-box">
                    <p><strong>Remember:</strong> Tool-calling is what separates conversational AI from <em>agentic AI</em>. You've just learned the foundation that powers the next generation of intelligent systems.</p>
                </div>
            </div>
        `
    },
    blog2: {
        title: 'Getting Started with LangChain',
        category: 'Tutorial',
        date: 'October 28, 2025',
        readTime: '10 min read',
        content: `
            <div class="blog-hero">
                <span class="blog-category">Tutorial</span>
                <span class="blog-date">October 28, 2025 • 10 min read</span>
            </div>
            <h1>Getting Started with LangChain</h1>
            
            <p class="blog-intro">LangChain has become the go-to framework for building LLM-powered applications. This comprehensive tutorial will guide you through everything you need to know to start building with LangChain.</p>
            
            <h2>What is LangChain?</h2>
            <p>LangChain is a powerful framework for developing applications powered by language models. It provides a standard interface for chains, lots of integrations with other tools, and end-to-end chains for common applications.</p>
            
            <h2>Installation and Setup</h2>
            <p>Getting started is straightforward. First, install LangChain:</p>
            
            <pre><code>pip install langchain openai python-dotenv</code></pre>
            
            <p>Set up your environment variables:</p>
            
            <pre><code># .env file
OPENAI_API_KEY=your-api-key-here</code></pre>
            
            <h2>Core Concepts</h2>
            
            <h3>1. Models</h3>
            <p>LangChain supports various LLM providers. Here's how to use OpenAI:</p>
            
            <pre><code>from langchain.llms import OpenAI

llm = OpenAI(temperature=0.9)
response = llm("Write a poem about Python programming")
print(response)</code></pre>
            
            <h3>2. Prompts</h3>
            <p>Prompt templates help you create dynamic prompts:</p>
            
            <pre><code>from langchain.prompts import PromptTemplate

template = """
You are a helpful AI assistant specializing in {topic}.
Question: {question}
Answer:"""

prompt = PromptTemplate(
    input_variables=["topic", "question"],
    template=template
)

formatted_prompt = prompt.format(
    topic="Python programming",
    question="What are decorators?"
)</code></pre>
            
            <h3>3. Chains</h3>
            <p>Chains allow you to combine multiple components:</p>
            
            <pre><code>from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(
    topic="Python programming",
    question="What are decorators?"
)</code></pre>
            
            <h2>Building a Simple QA System</h2>
            <p>Let's build a question-answering system over your documents:</p>
            
            <pre><code>from langchain.document_loaders import TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA

# Load documents
loader = TextLoader('document.txt')
documents = loader.load()

# Create embeddings and vector store
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# Create QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever()
)

# Ask questions
answer = qa_chain.run("What is this document about?")</code></pre>
            
            <h2>Memory Management</h2>
            <p>Add memory to maintain conversation context:</p>
            
            <pre><code>from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory
)

# Have a conversation
conversation.predict(input="Hi, my name is DevJitin")
conversation.predict(input="What's my name?")</code></pre>
            
            <h2>Advanced Features</h2>
            
            <h3>Agents</h3>
            <p>Create agents that can use tools:</p>
            
            <pre><code>from langchain.agents import load_tools, initialize_agent

tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description"
)

agent.run("What is the weather in New York today?")</code></pre>
            
            <h2>Best Practices</h2>
            <ul>
                <li><strong>Start Simple:</strong> Begin with basic chains and gradually add complexity</li>
                <li><strong>Use Callbacks:</strong> Implement callbacks for debugging and monitoring</li>
                <li><strong>Optimize Prompts:</strong> Spend time crafting effective prompts</li>
                <li><strong>Cache Results:</strong> Use caching to reduce API calls and costs</li>
                <li><strong>Handle Errors:</strong> Implement proper error handling for production apps</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>LangChain provides a powerful foundation for building LLM applications. With its modular design and extensive integrations, you can quickly build sophisticated AI-powered systems. Start experimenting with these examples and explore the official documentation for more advanced use cases!</p>
        `
    },
    blog3: {
        title: 'Python Automation Best Practices',
        category: 'Automation',
        date: 'September 20, 2025',
        readTime: '12 min read',
        content: `
            <div class="blog-hero">
                <span class="blog-category">Automation</span>
                <span class="blog-date">September 20, 2025 • 12 min read</span>
            </div>
            <h1>Python Automation Best Practices</h1>
            
            <p class="blog-intro">After years of building automation scripts and frameworks, I've learned what makes automation code robust, maintainable, and production-ready. Here are the essential best practices every Python automation developer should know.</p>
            
            <h2>1. Structure Your Automation Projects</h2>
            <p>A well-organized project structure is crucial for maintainability:</p>
            
            <pre><code>automation_project/
├── config/
│   ├── settings.py
│   └── credentials.json
├── scripts/
│   ├── data_processing.py
│   └── report_generation.py
├── utils/
│   ├── logger.py
│   └── helpers.py
├── tests/
│   └── test_scripts.py
├── logs/
├── requirements.txt
└── main.py</code></pre>
            
            <h2>2. Configuration Management</h2>
            <p>Never hardcode configurations. Use environment variables and config files:</p>
            
            <pre><code>import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv('API_KEY')
    DATABASE_URL = os.getenv('DATABASE_URL')
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
    
    @classmethod
    def validate(cls):
        required = ['API_KEY', 'DATABASE_URL']
        for var in required:
            if not getattr(cls, var):
                raise ValueError(f"Missing {var}")</code></pre>
            
            <h2>3. Robust Error Handling</h2>
            <p>Implement comprehensive error handling with retry logic:</p>
            
            <pre><code>import time
from functools import wraps

def retry(max_attempts=3, delay=1, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            current_delay = delay
            
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts == max_attempts:
                        raise
                    time.sleep(current_delay)
                    current_delay *= backoff
                    
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_data(url):
    # Your API call here
    pass</code></pre>
            
            <h2>4. Comprehensive Logging</h2>
            <p>Proper logging is essential for debugging and monitoring:</p>
            
            <pre><code>import logging
from datetime import datetime

def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # File handler
    fh = logging.FileHandler(
        f'logs/{name}_{datetime.now():%Y%m%d}.log'
    )
    fh.setLevel(logging.INFO)
    
    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.WARNING)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    
    logger.addHandler(fh)
    logger.addHandler(ch)
    
    return logger</code></pre>
            
            <h2>5. Use Context Managers</h2>
            <p>Context managers ensure proper resource cleanup:</p>
            
            <pre><code>from contextlib import contextmanager

@contextmanager
def database_connection(db_url):
    conn = create_connection(db_url)
    try:
        yield conn
    finally:
        conn.close()

with database_connection(DB_URL) as conn:
    # Use connection
    results = conn.execute(query)</code></pre>
            
            <h2>6. Asynchronous Operations</h2>
            <p>Use async/await for I/O-bound operations:</p>
            
            <pre><code>import asyncio
import aiohttp

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.json()

async def fetch_multiple(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# Run async code
results = asyncio.run(fetch_multiple(urls))</code></pre>
            
            <h2>7. Progress Tracking</h2>
            <p>Provide feedback for long-running operations:</p>
            
            <pre><code>from tqdm import tqdm

def process_items(items):
    results = []
    for item in tqdm(items, desc="Processing"):
        result = process_single_item(item)
        results.append(result)
    return results</code></pre>
            
            <h2>8. Testing Automation Scripts</h2>
            <p>Write tests for your automation code:</p>
            
            <pre><code>import pytest
from unittest.mock import patch, Mock

def test_data_processing():
    # Arrange
    test_data = {'key': 'value'}
    
    # Act
    result = process_data(test_data)
    
    # Assert
    assert result['status'] == 'success'

@patch('requests.get')
def test_api_call(mock_get):
    mock_get.return_value.json.return_value = {'data': 'test'}
    result = fetch_data('http://api.example.com')
    assert result == {'data': 'test'}</code></pre>
            
            <h2>9. Schedule Automation Tasks</h2>
            <p>Use APScheduler for task scheduling:</p>
            
            <pre><code>from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# Run every day at 9 AM
scheduler.add_job(
    daily_report,
    'cron',
    hour=9,
    minute=0
)

# Run every 30 minutes
scheduler.add_job(
    data_sync,
    'interval',
    minutes=30
)

scheduler.start()</code></pre>
            
            <h2>10. Notification System</h2>
            <p>Implement notifications for important events:</p>
            
            <pre><code>def send_notification(message, level='info'):
    if level == 'error':
        # Send email or Slack message
        send_email(ADMIN_EMAIL, 'Error Alert', message)
    
    # Always log
    logger.log(message, level=level)

try:
    run_automation()
except Exception as e:
    send_notification(
        f"Automation failed: {str(e)}",
        level='error'
    )</code></pre>
            
            <h2>Conclusion</h2>
            <p>Following these best practices will make your automation scripts more reliable, maintainable, and production-ready. Remember that automation is not just about writing code that works – it's about writing code that continues to work reliably over time.</p>
            
            <p>Start implementing these practices in your current projects, and you'll see immediate improvements in code quality and reliability. Happy automating!</p>
        `
    }
};

// Open Blog Modal
function openBlogModal(blogId) {
    const modal = document.getElementById('blogModal');
    const modalBody = document.getElementById('blogModalBody');
    const data = blogData[blogId];
    
    if (data) {
        modalBody.innerHTML = data.content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close Blog Modal
function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Update window click handler to close both modals
window.onclick = function(event) {
    const xperimentModal = document.getElementById('xperimentModal');
    const blogModal = document.getElementById('blogModal');
    
    if (event.target === xperimentModal) {
        closeXperimentModal();
    }
    if (event.target === blogModal) {
        closeBlogModal();
    }
}

// Timeline Navigation
function scrollTimeline(direction) {
    const track = document.querySelector('.timeline-track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track) return;
    
    const cardWidth = 320; // Node width
    const gap = 32; // 2rem gap
    const scrollAmount = cardWidth + gap; // Exact scroll per card
    
    if (direction === 'left') {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    // Update button states after scroll animation
    setTimeout(() => {
        updateButtonStates();
    }, 400);
}

function updateButtonStates() {
    const track = document.querySelector('.timeline-track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    // Check if at start
    if (track.scrollLeft <= 10) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Check if at end (with small tolerance)
    const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    if (isAtEnd) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top and clear hash on page load/refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // Clear URL hash to ensure home section
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }
    
    // Initialize Particle Background immediately
    const particleBg = new ParticleBackground();
    console.log('Particle background initialized');
    
    // Initialize Navigation
    initNavigation();
    
    // Initialize Music Control
    initMusicControl();
    
    // Initialize Role Typewriter with delay
    setTimeout(() => {
        initRoleTypewriter();
    }, 1000);
    
    // Initialize Contact Form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Initialize Timeline
    updateButtonStates();
    const track = document.querySelector('.timeline-track');
    if (track) {
        track.addEventListener('scroll', updateButtonStates);
        
        // Start at beginning to show first 2 cards by default
        setTimeout(() => {
            track.scrollLeft = 0;
            updateButtonStates();
        }, 100);
    }
});