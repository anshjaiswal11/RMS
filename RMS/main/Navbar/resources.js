const videoData = {
    CHE110: [
        { title: 'Introduction to Environmental Engineering', url: 'https://www.youtube.com/watch?v=KRUz68YmlTk' },
        { title: 'Environmental Studies - Overview', url: 'https://www.youtube.com/watch?v=CN9XGyTfI68' },
        { title: 'Environmental Impact Assessment', url: 'https://www.youtube.com/watch?v=jzW6w4Fq8JQ' },
        { title: 'Pollution Control Technologies', url: 'https://www.youtube.com/watch?v=Y5cX7N77Fg0' },
        { title: 'Sustainable Development', url: 'https://www.youtube.com/watch?v=_Rdw0XybWxE' },
        { title: 'Climate Change and Its Effects', url: 'https://www.youtube.com/watch?v=Yd9OzrMWqes' },
        { title: 'Waste Management', url: 'https://www.youtube.com/watch?v=x40W2k4RRj4' },
        { title: 'Renewable Energy Sources', url: 'https://www.youtube.com/watch?v=GkClzMJXFlI' }
    ],
    CSE111: [
        { title: 'Introduction to Computing', url: 'https://www.youtube.com/watch?v=x4mS04S8ZCE' },
        { title: 'Basic Concepts of Computing', url: 'https://www.youtube.com/watch?v=V4D2aS71Bzc' },
        { title: 'Computing Fundamentals', url: 'https://www.youtube.com/watch?v=Vb8OCr01K4I' },
        { title: 'Operating Systems Overview', url: 'https://www.youtube.com/watch?v=okhEDB5nxN8' },
        { title: 'Computer Hardware Basics', url: 'https://www.youtube.com/watch?v=zjZJfLSLE9k' },
        { title: 'Software and Applications', url: 'https://www.youtube.com/watch?v=nRfOH19sW7o' },
        { title: 'Introduction to Programming', url: 'https://www.youtube.com/watch?v=ymQv0FzRSfE' },
        { title: 'Networking Basics', url: 'https://www.youtube.com/watch?v=fE1W3i8fdlk' }
    ],
    CSE326: [
        { title: 'Introduction to Internet Programming', url: 'https://www.youtube.com/watch?v=mATCOkD5xDw' },
        { title: 'HTML Basics', url: 'https://www.youtube.com/watch?v=3JluqTojuME' },
        { title: 'CSS Basics', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc' },
        { title: 'JavaScript Fundamentals', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
        { title: 'Responsive Web Design', url: 'https://www.youtube.com/watch?v=Y5xd9LQj4y4' },
        { title: 'AJAX and Fetch API', url: 'https://www.youtube.com/watch?v=3tA7ZUhOdo8' },
        { title: 'Web Development Tools', url: 'https://www.youtube.com/watch?v=J1Ptb_KjE4Y' },
        { title: 'Introduction to Node.js', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4' }
    ],
    ECE249: [
        { title: 'Basics of Electrical Engineering', url: 'https://www.youtube.com/watch?v=5gz1Nw70pRk' },
        { title: 'AC and DC Circuits', url: 'https://www.youtube.com/watch?v=1ce38W6Q8wo' },
        { title: 'Circuit Theorems', url: 'https://www.youtube.com/watch?v=5L9VZ9X0WeM' },
        { title: 'Electromagnetic Theory', url: 'https://www.youtube.com/watch?v=ZGrwKfkQO1Q' },
        { title: 'Transformers and Machines', url: 'https://www.youtube.com/watch?v=UR5VV2z3Sa0' },
        { title: 'Analog Electronics Basics', url: 'https://www.youtube.com/watch?v=fm_pGzwvBbo' },
        { title: 'Electronic Components', url: 'https://www.youtube.com/watch?v=mkW7ScXaKoc' },
        { title: 'Power Systems Overview', url: 'https://www.youtube.com/watch?v=4lXN3o_V21I' }
    ],
    ECE279: [
        { title: 'Introduction to Electrical Lab', url: 'https://www.youtube.com/watch?v=6GxT_r2VW0o' },
        { title: 'Basic Electrical Lab Experiments', url: 'https://www.youtube.com/watch?v=nSQwxnI4G7g' },
        { title: 'Circuit Construction Techniques', url: 'https://www.youtube.com/watch?v=a5m9W4W10YM' },
        { title: 'Testing Electrical Components', url: 'https://www.youtube.com/watch?v=pkwLMN1xVHE' },
        { title: 'Electrical Measurements', url: 'https://www.youtube.com/watch?v=LFWrc8FqMug' },
        { title: 'Oscilloscope Basics', url: 'https://www.youtube.com/watch?v=DhFLvHzlO60' },
        { title: 'Power Supply Testing', url: 'https://www.youtube.com/watch?v=8ZXb4yUe8h4' },
        { title: 'Lab Safety Procedures', url: 'https://www.youtube.com/watch?v=cVbOGmN3uCI' }
    ],
    INT108: [
        { title: 'Introduction to Python Programming', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
        { title: 'Python Basics', url: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg' },
        { title: 'Python Data Structures', url: 'https://www.youtube.com/watch?v=WGJJIrtnfpk' },
        { title: 'Functions and Modules in Python', url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I' },
        { title: 'Object-Oriented Programming in Python', url: 'https://www.youtube.com/watch?v=JeznW_7DlB0' },
        { title: 'Error Handling in Python', url: 'https://www.youtube.com/watch?v=NI26dqhs2eM' },
        { title: 'Working with Files in Python', url: 'https://www.youtube.com/watch?v=Uh2ebFW8OYM' },
        { title: 'Python Project Examples', url: 'https://www.youtube.com/watch?v=1F6hn5KXb34' }
    ],
    INT306: [
        { title: 'Introduction to Database Management Systems', url: 'https://www.youtube.com/watch?v=9k0GpSmbEGE' },
        { title: 'SQL Basics', url: 'https://www.youtube.com/watch?v=7s4A4CStR34' },
        { title: 'Normalization in DBMS', url: 'https://www.youtube.com/watch?v=w2l0p-Pz4u0' },
        { title: 'Database Design Concepts', url: 'https://www.youtube.com/watch?v=bDke1szP9_A' },
        { title: 'Transactions and Concurrency Control', url: 'https://www.youtube.com/watch?v=Hsz5CNR6J00' },
        { title: 'Database Security', url: 'https://www.youtube.com/watch?v=mmw7bkC8eik' },
        { title: 'Data Warehousing', url: 'https://www.youtube.com/watch?v=2AzhgYb3J2g' },
        { title: 'NoSQL Databases Overview', url: 'https://www.youtube.com/watch?v=7bQ_O7cP3F8' }
    ],
    MEC136: [
        { title: 'Introduction to Engineering Graphics', url: 'https://www.youtube.com/watch?v=BJrVniVJK7w' },
        { title: 'Drawing Techniques and Tools', url: 'https://www.youtube.com/watch?v=KHZy4gvRsB8' },
        { title: 'Orthographic Projections', url: 'https://www.youtube.com/watch?v=Tp3ERmZlQu0' },
        { title: 'Isometric Drawings', url: 'https://www.youtube.com/watch?v=fbGp72T-S0Q' },
        { title: 'CAD Basics', url: 'https://www.youtube.com/watch?v=2x8uFc1_c6o' },
        { title: 'Engineering Sketching', url: 'https://www.youtube.com/watch?v=bDb9d1AZ9a8' },
        { title: 'Digital Fabrication Techniques', url: 'https://www.youtube.com/watch?v=qc_2W4uSxw4' },
        { title: '3D Modeling Basics', url: 'https://www.youtube.com/watch?v=7Yv5w8Fj4wE' }
    ],
    MTH174: [
        { title: 'Introduction to Engineering Mathematics', url: 'https://www.youtube.com/watch?v=gb7r7mHp1J0' },
        { title: 'Calculus Fundamentals', url: 'https://www.youtube.com/watch?v=Oe3uOxXoX9o' },
        { title: 'Linear Algebra Basics', url: 'https://www.youtube.com/watch?v=5C_jgA-NtU8' },
        { title: 'Differential Equations', url: 'https://www.youtube.com/watch?v=w1l1xPL5G8o' },
        { title: 'Complex Numbers', url: 'https://www.youtube.com/watch?v=loHkCqLFnCQ' },
        { title: 'Probability and Statistics', url: 'https://www.youtube.com/watch?v=Q58cfu13pT8' },
        { title: 'Vectors and Matrices', url: 'https://www.youtube.com/watch?v=CBiTAVj87iE' },
        { title: 'Mathematical Modeling', url: 'https://www.youtube.com/watch?v=nf4aUqvOXwM' }
    ],
    MTH401: [
        { title: 'Introduction to Discrete Mathematics', url: 'https://www.youtube.com/watch?v=vj-Psl2cn-0' },
        { title: 'Sets and Relations', url: 'https://www.youtube.com/watch?v=kks0O0reG_8' },
        { title: 'Algorithms and Complexity', url: 'https://www.youtube.com/watch?v=1wDCA5S6Vw0' },
        { title: 'Boolean Algebra Basics', url: 'https://www.youtube.com/watch?v=ZecFPt8jH6w' },
        { title: 'Number Theory Introduction', url: 'https://www.youtube.com/watch?v=3F5TaQbQvX4' },
        { title: 'Recurrence Relations', url: 'https://www.youtube.com/watch?v=V1eJrjK9c10' },
        { title: 'Graph Theory Basics', url: 'https://www.youtube.com/watch?v=6_JsJ5ltlUM' },
        { title: 'Combinatorics Introduction', url: 'https://www.youtube.com/watch?v=dLsWJ9eyU9I' }
    ],
    PES318: [
        { title: 'Communication Skills Essentials', url: 'https://www.youtube.com/watch?v=0irMljWL3Wg' },
        { title: 'Presentation Skills Tutorial', url: 'https://www.youtube.com/watch?v=Z0oZyTw2KrA' },
        { title: 'Teamwork and Collaboration', url: 'https://www.youtube.com/watch?v=vgyk23XQWT0' },
        { title: 'Time Management Tips', url: 'https://www.youtube.com/watch?v=DtKh3pS0EwE' },
        { title: 'Problem-Solving Skills', url: 'https://www.youtube.com/watch?v=J2R8ohYN4Tk' },
        { title: 'Critical Thinking', url: 'https://www.youtube.com/watch?v=LR_7QehqCcs' },
        { title: 'Interpersonal Skills', url: 'https://www.youtube.com/watch?v=F7et_f9NdiI' },
        { title: 'Career Development', url: 'https://www.youtube.com/watch?v=oeYoS2Nbi88' }
    ],
    PHY110: [
        { title: 'Introduction to Engineering Physics', url: 'https://www.youtube.com/watch?v=f3DqvKvN2VE' },
        { title: 'Kinematics Basics', url: 'https://www.youtube.com/watch?v=FKhR0YsMD38' },
        { title: 'Dynamics of Particles', url: 'https://www.youtube.com/watch?v=SP0V_tTcGn8' },
        { title: 'Optics Fundamentals', url: 'https://www.youtube.com/watch?v=KxFICF8HkM8' },
        { title: 'Electromagnetism Basics', url: 'https://www.youtube.com/watch?v=b3PaYzH6c9k' },
        { title: 'Wave Phenomena', url: 'https://www.youtube.com/watch?v=0r2zLEnzu6A' },
        { title: 'Thermodynamics Overview', url: 'https://www.youtube.com/watch?v=42RtW8_8p7s' },
        { title: 'Quantum Mechanics Introduction', url: 'https://www.youtube.com/watch?v=vP0SAD6qaQA' }
    ]
};


document.addEventListener('DOMContentLoaded', function () {
    const themeButton = document.querySelector('[data-theme-btn]');
    const body = document.body;
    const noSelectionMessage = document.getElementById('noSelectionMessage');
    const selectedSubjects = document.getElementById('selectedSubjects');
    const searchBox = document.getElementById('searchBox');
    const subjectsList = document.getElementById('subjectsList');
    const notesContainer = document.getElementById("myDiv");
    const chaptername = document.querySelector("#chapters");

    themeButton.addEventListener('click', function () {
        if (body.getAttribute('data-theme') === 'dark') {
            body.setAttribute('data-theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    })});

document.addEventListener('DOMContentLoaded', function() {
    const subjectSelect = document.getElementById('subjectSelect');
    const videoContainer = document.getElementById('videoContainer');
    const resultMessage = document.getElementById('resultMessage');
    const clearAllButton = document.getElementById('clearAll');
    
    subjectSelect.addEventListener('change', function() {
        const subject = subjectSelect.value;
        displayVideos(subject);
    });
    
    clearAllButton.addEventListener('click', function() {
        subjectSelect.value = '';
        videoContainer.innerHTML = '';
        resultMessage.textContent = '0 Results Found';
    });
    
    function displayVideos(subject) {
        videoContainer.innerHTML = '';
        
        if (subject && videoData[subject]) {
            videoData[subject].forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.classList.add('video-card');
                
                videoCard.innerHTML = `
                    <iframe src="${video.url}?autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <div class="video-header">${video.title}</div>
                `;
                
                videoContainer.appendChild(videoCard);
            });
            
            resultMessage.textContent = `${videoData[subject].length} Results Found`;
        } else {
            resultMessage.textContent = '0 Results Found';
        }
    }
});
