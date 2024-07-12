

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
    const subjectHeader = button.parentElement;
    const subjectName = subjectHeader.getElementsByClassName('header4')[0].innerText;

    const selectedSubjects = document.getElementById('selectedSubjects');
    const existingSubject = Array.from(selectedSubjects.getElementsByClassName('header4'))
        .find(header => header.innerText === subjectName);

    if (existingSubject) {
        // i am adding few comments for understamginfg the cide
        // here we can subject the subject and if the subject is already selected, this will remove it
        existingSubject.parentElement.parentElement.remove();
        button.textContent = '+';
        button.style.backgroundColor = 'green';
        button.onclick = () => selectSubject(button);
    } else {
        // when we clickedin '+' button a new subject item will come for the selected list
        const newSubjectItem = document.createElement('div');
        newSubjectItem.className = 'subject-item';
        newSubjectItem.innerHTML = `
            <div class="subject-header">
                <h4 class="header4">${subjectName}</h4>
            </div>
            <div class="dropdown-content">
                <button><p>Notes</p><button>
                <button><p>MCQs</p></button>
                <button><p>PYQs</p></button>
            </div>
        `;

        // here we are dding  event listener for hover to show dropdown
        newSubjectItem.addEventListener('mouseenter', () => {
            const dropdownContent = newSubjectItem.getElementsByClassName('dropdown-content')[0];
            dropdownContent.style.display = 'flex';
            dropdownContent.style.trasitions = '0.4s';
        });

        newSubjectItem.addEventListener('mouseleave', () => {
            const dropdownContent = newSubjectItem.getElementsByClassName('dropdown-content')[0];
            dropdownContent.style.display = 'none';
        });

        // Append the new subject item to selected subjects
        selectedSubjects.appendChild(newSubjectItem);

        // chagnginb "x" and color to red
        button.textContent = 'x';
        button.style.backgroundColor = 'red';
    }
}
