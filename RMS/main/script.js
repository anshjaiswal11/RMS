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
    });

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

    function updateNoSubjectsMessage() {
        const hasSelectedSubjects = selectedSubjects.getElementsByClassName('subject-item').length > 0;
        noSelectionMessage.style.display = hasSelectedSubjects ? 'none' : 'block';
    }

    window.selectSubject = function (button) {
        const subjectHeader = button.parentElement;
        const subjectName = subjectHeader.getElementsByClassName('header4')[0].innerText;
        const existingSubject = Array.from(selectedSubjects.getElementsByClassName('header4'))
            .find(header => header.innerText === subjectName);

        if (existingSubject) {
            existingSubject.parentElement.parentElement.remove();
            button.textContent = '+';
            button.style.backgroundColor = 'green';
        } else {
            const newSubjectItem = document.createElement('div');
            newSubjectItem.className = 'subject-item';
            newSubjectItem.innerHTML = `
                <div class="subject-header">
                    <h4 class="header4">${subjectName}</h4>
                </div>
                <div class="dropdown-content hide">
                    <button id="dropdown-btn-notes"><p>Notes</p></button>
                    <button id="dropdown-btn-mcqs"><p>MCQs</p></button>
                    <button><p>PYQs</p></button>
                </div>
            `;

            const dropdownBtnNotes = newSubjectItem.querySelector("#dropdown-btn-notes");
            const dropdownBtnMCQs = newSubjectItem.querySelector("#dropdown-btn-mcqs");
            const chapters = document.getElementById("chapters");

            dropdownBtnNotes.addEventListener('click', () => {
                chaptername.style.display = 'flex';
                notesContainer.style.display = 'block';
            });
            function fetchAndDisplayChapterNotes(chapterNumber) {
                fetch('https://raw.githubusercontent.com/CODINGWITHU/RMSAPI/main/RMS.JSON')
                    .then(response => response.json())
                    .then(data => {
                        const chapterData = data[subjectName].Notes.chapters[chapterNumber];
                        if (chapterData) {
                            const embedLink = chapterData.replace("/view", "/preview");
                            notesContainer.innerHTML = `
                                <h1 class="title">${subjectName}</h1>
                                <br>
                                <h2 class="title2">Chapter ${chapterNumber}</h2>
                                <br>
                                <iframe src="${embedLink}" class="chapter-iframe" allow="autoplay"></iframe>
                            `;
                        } else {
                            notesContainer.innerHTML = `<p>No notes available for Chapter ${chapterNumber}.</p>`;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching the data:', error);
                        notesContainer.innerHTML = `<p>Error loading notes. Please try again later.</p>`;
                    });
            }
            const chapterLinks = chapters.getElementsByClassName('one');
            Array.from(chapterLinks).forEach((chapterLink, index) => {
                chapterLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    fetchAndDisplayChapterNotes(index + 1);
                });
            });

            dropdownBtnMCQs.addEventListener('click', () => {
                chaptername.style.display = 'none';
                notesContainer.style.display = 'block';

                fetch('https://raw.githubusercontent.com/ravi-kumar-t/json/main/api.json')
                    .then(response => response.json())
                    .then(data => {
                        const mcqList = data[subjectName] ? data[subjectName].MCQs : [];
                        notesContainer.innerHTML = `<h1 class="title">${subjectName} MCQs</h1>`;

                        displayMCQs(mcqList, subjectName);
                    })
                    .catch(error => {
                        console.error('Error fetching the data:', error);
                        notesContainer.innerHTML = `<p>Error loading MCQs. Please try again later.</p>`;
                    });
            });

            newSubjectItem.addEventListener('mouseenter', () => {
                newSubjectItem.querySelector('.dropdown-content').classList.remove('hide');
            });
            newSubjectItem.addEventListener('mouseleave', () => {
                newSubjectItem.querySelector('.dropdown-content').classList.add('hide');
            });

            selectedSubjects.appendChild(newSubjectItem);
            button.textContent = '−';
            button.style.backgroundColor = 'red';
        }

        updateNoSubjectsMessage();
    };

    function displayMCQs(mcqList, subjectName) {
        if (mcqList.length === 0) {
            notesContainer.innerHTML = `<p>No MCQs available.</p>`;
            return;
        }

        let currentQuestionIndex = 0;
        let score = 0;

        function renderQuestion(index) {
            const mcq = mcqList[index];
            notesContainer.innerHTML = `
                <h1 class="title">${subjectName} MCQs</h1>
                <div class="mcq-container">
                    <div class="mcq-question">
                        <p><strong>Q${index + 1}:</strong> ${mcq.question}</p>
                        <div id="mcq-options">
                            ${mcq.options.map((option, i) => `
                                <label class="mcq-option">
                                    <input type="radio" name="mcq${index}" value="${option}" />
                                    ${option}
                                    <span class="mcq-checkmark"></span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mcq-buttons">
                        <button class="mcq-btn mcq-btn-primary" ${index === 0 ? 'style="display:none;"' : ''} onclick="prevQuestion(${index})">Previous</button>
                        <button class="mcq-btn mcq-btn-success mcq-btn-next" ${index === mcqList.length - 1 ? 'style="display:none;"' : ''} onclick="nextQuestion(${index})">Next</button>
                        <button class="mcq-btn mcq-btn-success" ${index < mcqList.length - 1 ? 'style="display:none;"' : ''} onclick="submitAllAnswers()">Submit</button>
                    </div>
                    <p id="feedback-${index}" class="feedback"></p>
                </div>
            `;
        }

        window.nextQuestion = function (index) {
            const selectedOption = document.querySelector(`input[name="mcq${index}"]:checked`);
            if (selectedOption) {
                const userAnswer = selectedOption.value;
                const correctAnswer = mcqList[index].answer;

                if (userAnswer === correctAnswer) {
                    score++;
                }

                currentQuestionIndex++;
                renderQuestion(currentQuestionIndex);
            } else {
                document.getElementById(`feedback-${index}`).textContent = 'Please select an option.';
                document.getElementById(`feedback-${index}`).style.color = 'orange';
            }
        };

        window.prevQuestion = function (index) {
            if (index > 0) {
                currentQuestionIndex--;
                renderQuestion(currentQuestionIndex);
            }
        };

        window.submitAllAnswers = function () {
            const selectedOption = document.querySelector(`input[name="mcq${currentQuestionIndex}"]:checked`);
            if (selectedOption || currentQuestionIndex === mcqList.length) {
                let emoji = '';
                let message = '';

                if (score === mcqList.length) {
                    emoji = '🥳';
                    message = '<span>Well Done! You got all questions correct.</span>';
                } else {
                    emoji = '😣';
                    message = '<span>Better Luck Next Time</span>';
                }

                notesContainer.innerHTML = `
                    <h1 class="title">Your Score: ${score}/${mcqList.length} ${emoji}</h1>
                    ${message}
                    <button class="mcq-btn mcq-btn-primary" onclick="retryQuiz()">Try Again</button>
                `;
            } else {
                document.getElementById(`feedback-${currentQuestionIndex}`).textContent = 'Please select an option for the last question.';
                document.getElementById(`feedback-${currentQuestionIndex}`).style.color = 'orange';
            }
        };

        window.retryQuiz = function () {
            currentQuestionIndex = 0;
            score = 0;
            renderQuestion(currentQuestionIndex);
        };

        renderQuestion(currentQuestionIndex);
    }
});
