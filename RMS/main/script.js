document.addEventListener('DOMContentLoaded', function () {
    const themeButton = document.querySelector('[data-theme-btn]');
    const body = document.body;
    const noSelectionMessage = document.getElementById('noSelectionMessage');
    const selectedSubjects = document.getElementById('selectedSubjects');
    const searchBox = document.getElementById('searchBox');
    const subjectsList = document.getElementById('subjectsList');

    // theme btn fnlty (white and dark)
    themeButton.addEventListener('click', function () {
        if (body.getAttribute('data-theme') === 'dark') {
            body.setAttribute('data-theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    });

    // filteri g the aubjects based on name
    window.filterSubjects = function () {
        const filter = searchBox.value.toLowerCase();
        const subjects = subjectsList.getElementsByClassName('subject-item');
        Array.from(subjects).forEach(subject => {
            const subjectName = subject.getElementsByClassName('header4')[0].innerText.toLowerCase();
            if (subjectName.includes(filter)) {
                subject.style.display = '';
            } else {
                subject.style.display = 'none';
            }
        });
    };

    // fn to update the message aftre sub is selected
    function updateNoSubjectsMessage() {
        const hasSelectedSubjects = selectedSubjects.getElementsByClassName('subject-item').length > 0;
        noSelectionMessage.style.display = hasSelectedSubjects ? 'none' : 'block';
    }

    // fn to subject selecting the sub and un seceltg teh sub
    window.selectSubject = function (button) {
        const subjectHeader = button.parentElement;
        const subjectName = subjectHeader.getElementsByClassName('header4')[0].innerText;
        const existingSubject = Array.from(selectedSubjects.getElementsByClassName('header4'))
            .find(header => header.innerText === subjectName);

        if (existingSubject) {
        // here we are rmving subject if its already selected
            existingSubject.parentElement.parentElement.remove();
            button.textContent = '+';
            button.style.backgroundColor = 'green';
        } else {
        // adding new subject item to the selected list
            const newSubjectItem = document.createElement('div');
            newSubjectItem.className = 'subject-item';
            newSubjectItem.innerHTML = `
                <div class="subject-header">
                    <h4 class="header4">${subjectName}</h4>
                </div>
                <div class="dropdown-content hide">
                    <button id = "dropdown-btn" onclick = ""><p>Notes</p></button>
                    <button><p>MCQs</p></button>
                    <button><p>PYQs</p></button>
                </div>
            `;
            const dropdownBtn = newSubjectItem.querySelector("#dropdown-btn");
            const buttonId = newSubjectItem.querySelector("#btn-id");
            const notesContainer = document.getElementById("myDiv");
            const chaptername = document.querySelector("#chapters");
            
            dropdownBtn.addEventListener('click', () => {
                chaptername.style.display = 'flex'
                fetch('https://raw.githubusercontent.com/CODINGWITHU/RMSAPI/main/RMS.JSON')
                    .then(response => response.json())
                    .then(data => {
                        notesContainer.innerHTML = `<h1 class="title" >${subjectName}</h1>`
                        for (let i = 1; i <= 6; i++) {
                            if (data[subjectName].Notes.chapters[i]) {
                                const chapterData = data[subjectName].Notes.chapters[i];
                                const embedLink = chapterData.replace("/view", "/preview");
                                notesContainer.innerHTML += `
                                    <br>
                                    <h2 class="title2" >Chapter ${i}</h2>
                                    <br>
                                    <iframe src="${embedLink}" class="chapter-iframe" allow="autoplay"></iframe>
                                `;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching the data:', error);
                        notesContainer.innerHTML = `<p>Error loading notes. Please try again later.</p>`;
                    });
            });
        

        // added event listener for hoveing to show dropdown
            newSubjectItem.addEventListener('mouseenter', () => {
                const dropdownContent = newSubjectItem.getElementsByClassName('dropdown-content')[0];
                dropdownContent.classList.remove('hide');
                dropdownContent.style.display = 'flex';
            });

            newSubjectItem.addEventListener('mouseleave', () => {
                const dropdownContent = newSubjectItem.getElementsByClassName('dropdown-content')[0];
                dropdownContent.classList.add('hide');
                setTimeout(() => {
                    dropdownContent.style.display = 'none';
                }, 300);
            });


        // remove the new subject item to selected subjects
            selectedSubjects.appendChild(newSubjectItem);

            // changin "+" to "x" and color to ref
            button.textContent = 'x';
            button.style.backgroundColor = 'red';
        }

        // Update the message visibility
        updateNoSubjectsMessage();
    };

    // check ingwhen the page loads
    updateNoSubjectsMessage();

    const quizData = [{
        question: "Which of the following is a client site language?",
        a: "Java",
        b: "C",
        c: "Python",
        d: "JavaScript",
        correct: "d",
    },
    {
        question: "What does HTML stand for?",
        a: "Hypertext Markup Language",
        b: "Cascading Style Sheet",
        c: "Jason Object Notation",
        d: "Helicopters Terminals Motorboats Lamborginis",
        correct: "a",
    },
    {
        question: "What year was JavaScript launched?",
        a: "1996",
        b: "1995",
        c: "1994",
        d: "none of the above",
        correct: "b",
    },
    {
        question: "What does CSS stands for?",
        a: "Hypertext Markup Language",
        b: "Cascading Style Sheet",
        c: "Jason Object Notation",
        d: "Helicopters Terminals Motorboats Lamborginis",
        correct: "b",
    }
    ];
    let index = 0;
    let correct = 0,
    incorrect = 0,
    total = quizData.length;
    let questionBox = document.getElementById("questionBox");
    let allInputs = document.querySelectorAll("input[type='radio']")
    const loadQuestion = () => {
    if (total === index) {
        return quizEnd()
    }
    reset()
    const data = quizData[index]
    questionBox.innerHTML = `${index + 1}) ${data.question}`
    allInputs[0].nextElementSibling.innerText = data.a
    allInputs[1].nextElementSibling.innerText = data.b
    allInputs[2].nextElementSibling.innerText = data.c
    allInputs[3].nextElementSibling.innerText = data.d
    }
    
    document.querySelector("#submit").addEventListener(
    "click",
    function() {
        const data = quizData[index]
        const ans = getAnswer()
        if (ans === data.correct) {
            correct++;
        } else {
            incorrect++;
        }
        index++;
        loadQuestion()
    }
    )
    
    const getAnswer = () => {
    let ans;
    allInputs.forEach(
        (inputEl) => {
            if (inputEl.checked) {
                ans = inputEl.value;
            }
        }
    )
    return ans;
    }
    
    const reset = () => {
    allInputs.forEach(
        (inputEl) => {
            inputEl.checked = false;
        }
    )
    }
    
    const quizEnd = () => {
    // console.log(document.getElementsByClassName("container"));
    document.getElementsByClassName("containers")[0].innerHTML = `
        <div class="col" style = "text-align: center">
            <h3 class="w-100"> Hii, you've scored ${correct} / ${total} </h3>
        </div>
    `
    console.log(correct/total);
    }
    loadQuestion(index);

});

