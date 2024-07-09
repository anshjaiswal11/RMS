
function filterSubjects() {
    const searchInput = document.getElementById('searchBox').value.toUpperCase();
    const subjectsList = document.getElementById('subjectsList');
    const subjects = subjectsList.getElementsByClassName('header4');
    
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        const textValue = subject.textContent || subject.innerText;
        if (textValue.toUpperCase().indexOf(searchInput) > -1) {
            subject.style.display = "";
        } else {
            subject.style.display = "none";
        }
    }
}
