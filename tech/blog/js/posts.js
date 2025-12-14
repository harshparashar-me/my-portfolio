import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==========================================
// 1. APNE BLOG POSTS YAHAN ADD KAREIN 👇
// ==========================================
// Agar aapke paas Firebase account nahi hai, toh bas is list mein 
// naya post add kar dein. Website yahin se data utha legi.
const initialPosts = [
    {
        id: "8842",
        title: "Scaling Microservices: The gRPC Protocol",
        desc: "Analyzing the shift from REST to binary protocols for high-throughput internal communication layers.",
        date: "14.12.2024",
        readTime: "8 min read",
        tag: "SYS.ARCH",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        link: "posts/scaling-microservices-grpc.html",
        theme: "primary", // Colors: primary(cyan), secondary(purple), accent(red)
        timestamp: Date.now()
    },
    {
        id: "9921",
        title: "RAG Pipelines with Vector Embeddings",
        desc: "Implementing memory in LLMs using Pinecone and LangChain for context-aware responses.",
        date: "08.12.2024",
        readTime: "12 min read",
        tag: "AI.DATA",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        link: "posts/rag-vector-pipelines.html",
        theme: "secondary",
        timestamp: Date.now() - 10000
    },
    {
        id: "7734",
        title: "Next.js 14: Server Actions Deep Dive",
        desc: "Eliminating API routes and handling mutations directly from server components securely.",
        date: "20.11.2024",
        readTime: "6 min read",
        tag: "REACT.INT",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        link: "#", 
        theme: "accent",
        timestamp: Date.now() - 20000
    }
    // <-- Yahan comma (,) lagakar naya { } block add karein
];

// --- 2. Firebase Configuration & Init ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

let db;
let auth;

// System Start logic
if (firebaseConfig) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        initBlogSystem();
    } catch (e) {
        console.log("Using Static Mode (No Database Connection)");
        renderBlogPosts(initialPosts); // Fallback to list above
    }
} else {
    // Agar config nahi mili (mtlb simple HTML environment), toh static data use karo
    console.log("Using Static Mode (Local Data)");
    renderBlogPosts(initialPosts);
}

// --- 3. Main System Logic ---
async function initBlogSystem() {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }

        const postsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'blog_posts');
        const snapshot = await getDocs(postsCollection);

        if (snapshot.empty) {
            // Agar DB khali hai, toh local data dikhao
            renderBlogPosts(initialPosts);
        } else {
            console.log("Data loaded from Cloud Database");
            const posts = snapshot.docs.map(doc => doc.data());
            posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            renderBlogPosts(posts);
        }

    } catch (error) {
        // Agar koi bhi error aaye, toh chupchap local data dikha do
        console.log("Switching to Static Mode due to error.");
        renderBlogPosts(initialPosts);
    }
}

// --- 4. Render Logic (UI Banana) ---
function renderBlogPosts(posts) {
    const grid = document.getElementById('blog-grid');
    const dirList = document.getElementById('directory-list');
    
    if (!grid || !dirList) return;

    grid.innerHTML = '';
    dirList.innerHTML = '';

    posts.forEach((post, index) => {
        // 1. Generate Card HTML
        const card = `
        <a href="${post.link}" class="block h-full group">
            <article class="tilt-card h-full flex flex-col rounded-sm relative" onmousemove="handleTilt(event, this)" onmouseleave="resetTilt(this)">
                <div class="hud-corner tl"></div>
                <div class="hud-corner tr"></div>
                <div class="hud-corner bl"></div>
                <div class="hud-corner br"></div>

                <div class="h-48 overflow-hidden relative border-b border-white/5">
                    <div class="absolute inset-0 bg-cyber-${post.theme}/20 mix-blend-overlay z-10 opacity-50 group-hover:opacity-0 transition-opacity"></div>
                    <img src="${post.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" onerror="this.src='https://placehold.co/600x400/000000/FFF?text=No+Image'">
                    <div class="absolute top-4 left-4 z-20 px-2 py-1 bg-black/90 border border-cyber-${post.theme} text-cyber-${post.theme} font-mono text-[10px] tracking-wider">
                        ${post.tag}
                    </div>
                </div>
                
                <div class="p-6 flex flex-col flex-grow tilt-content">
                    <div class="font-mono text-[10px] text-gray-500 mb-4 flex justify-between items-center border-b border-white/5 pb-4">
                        <span class="text-cyber-${post.theme}">ID: ${post.id}</span>
                        <div class="flex items-center gap-3">
                            <span>// ${post.date}</span>
                            <span class="text-cyber-${post.theme}/70 flex items-center gap-1">
                                <i class="far fa-clock text-[9px]"></i> ${post.readTime}
                            </span>
                        </div>
                    </div>
                    
                    <h2 class="text-xl font-bold font-display text-white mb-3 group-hover:text-cyber-${post.theme} transition-colors leading-tight">
                        ${post.title}
                    </h2>
                    
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 flex-grow font-mono opacity-80">
                        ${post.desc}
                    </p>
                    
                    <div class="mt-auto pt-4 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                        <span>Execute_Read()</span>
                        <i class="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform text-cyber-${post.theme}"></i>
                    </div>
                </div>
            </article>
        </a>`;
        grid.innerHTML += card;

        // 2. Generate Directory Item HTML
        const dirItem = `
        <li class="group">
            <a href="${post.link}" class="flex items-start gap-3 text-gray-400 group-hover:text-white transition-colors">
                <span class="text-cyber-${post.theme} mt-1">0${index + 1}.</span>
                <span class="leading-relaxed border-b border-transparent group-hover:border-cyber-${post.theme}/50 transition-colors">${post.title}</span>
            </a>
        </li>`;
        dirList.innerHTML += dirItem;
    });
}
