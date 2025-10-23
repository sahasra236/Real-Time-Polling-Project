const socket = io();
const container = document.getElementById('poll-container');

socket.on('pollData', polls => {
  container.innerHTML = ''; // clear existing polls

  polls.forEach(poll => {
    const card = document.createElement('div');
    card.className = 'poll-card';

    const question = document.createElement('div');
    question.className = 'poll-question';
    question.textContent = poll.question;
    card.appendChild(question);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'poll-options';

    const btn1 = document.createElement('button');
    btn1.textContent = `${poll.option1} (${poll.votes1})`;
    btn1.className = 'option1';
    btn1.onclick = () => socket.emit('vote', { pollId: poll.id, option: 1 });
    optionsDiv.appendChild(btn1);

    const btn2 = document.createElement('button');
    btn2.textContent = `${poll.option2} (${poll.votes2})`;
    btn2.className = 'option2';
    btn2.onclick = () => socket.emit('vote', { pollId: poll.id, option: 2 });
    optionsDiv.appendChild(btn2);

    card.appendChild(optionsDiv);

    const results = document.createElement('div');
    results.className = 'poll-results';
    results.textContent = `Votes: ${poll.votes1} - ${poll.option1}, ${poll.votes2} - ${poll.option2}`;
    card.appendChild(results);

    container.appendChild(card);
  });
});
