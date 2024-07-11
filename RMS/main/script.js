function filterSubjects() {
    const searchInput = document.getElementById('searchBox').value.toUpperCase();
    const subjectsList = document.getElementById('subjectsList');
    const subjectItems = subjectsList.getElementsByClassName('subject-item');

    for (let i = 0; i < subjectItems.length; i++) {
        const subjectItem = subjectItems[i];
        const textValue = subjectItem.getElementsByClassName('header4')[0].textContent || subjectItem.getElementsByClassName('header4')[0].innerText;
        if (textValue.toUpperCase().indexOf(searchInput) > -1) {
            subjectItem.style.display = "";
        } else {
            subjectItem.style.display = "none";
        }
    }
}

function selectSubject(button) {
    const subjectItem = button.parentElement;
    const selectedSubjects = document.getElementById('selectedSubjects');
    const subjectText = subjectItem.getElementsByClassName('header4')[0].textContent || subjectItem.getElementsByClassName('header4')[0].innerText;
    const existingItems = selectedSubjects.getElementsByClassName('subject-item');
    for (let i = 0; i < existingItems.length; i++) {
        const existingText = existingItems[i].getElementsByClassName('header4')[0].textContent || existingItems[i].getElementsByClassName('header4')[0].innerText;
        if (existingText === subjectText) {
            return;
        }
    }
    const clonedItem = subjectItem.cloneNode(true);
    clonedItem.querySelector('button').remove(); 
    selectedSubjects.appendChild(clonedItem);
}
