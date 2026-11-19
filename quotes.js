/*
 * A quote above the copyright line in the footer. One is picked at random on
 * each visit; clicking it shows another. Edit the list below freely.
 */
(function () {
  'use strict';

  var QUOTES = [
    ['A robot may not injure a human being or, through inaction, allow a human being to come to harm.', 'Isaac Asimov'],
    ['Violence is the last refuge of the incompetent.', 'Isaac Asimov, Foundation'],
    ['Not all those who wander are lost.', 'J.R.R. Tolkien, The Fellowship of the Ring'],
    ['Fear is the mind-killer.', 'Frank Herbert, Dune'],
    ['The sky above the port was the color of television, tuned to a dead channel.', 'William Gibson, Neuromancer'],
    ['Don\'t Panic.', 'Douglas Adams, The Hitchhiker\'s Guide to the Galaxy'],
    ['I\'m sorry, Dave. I\'m afraid I can\'t do that.', 'HAL 9000, 2001: A Space Odyssey'],
    ['All those moments will be lost in time, like tears in rain.', 'Roy Batty, Blade Runner'],
    ['You are who you choose to be.', 'The Iron Giant'],
    ['Any sufficiently advanced technology is indistinguishable from magic.', 'Arthur C. Clarke'],
    ['Sometimes, dreams are all that separate us from the machines.', 'Dan Simmons, The Fall of Hyperion'],
    ['The future is never written...only penciled in.', 'Dan Simmons, Endymion'],
    ['If the universe has any soul, it is the soul of irony.', 'Dan Simmons, The Rise of Endymion'],
    ['The world outside has not become less real because the prisoner cannot see it.', 'J.R.R. Tolkien, On Fairy-Stories'],
    ['Time moves in one direction, memory in another.', 'William Gibson, Dead Man Sings'],
    ['The best definition of man is: a biped, ungrateful.', 'Fyodor Dostoevsky, Notes from Underground'],
    ['The formula "two plus two equals five" is not without its attractions.', 'Fyodor Dostoevsky, Notes from Underground'],
    ['Time is an illusion. Lunchtime doubly so.', 'Douglas Adams, The Hitchhiker\'s Guide to the Galaxy'],
    ['In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.', 'Douglas Adams, The Restaurant at the End of the Universe'],
    ['I don\'t want to survive. I want to live.', 'WALL·E'],
    ['Every victory against death will always be temporary.', 'Hollow Knight'],
    ['To live an age, yet remember so little...perhaps I should be thankful? All tragedy erased, I see only wonders.', 'Hollow Knight']
  ];

  var footer = document.querySelector('footer');
  if (!footer || !QUOTES.length) return;

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-quote';
  if (QUOTES.length > 1) button.title = 'Another quote';
  else button.disabled = true;            // nothing to cycle to
  footer.insertBefore(button, footer.firstChild);

  var current = -1;
  function show() {
    var next = current;
    if (QUOTES.length > 1) {
      while (next === current) next = Math.floor(Math.random() * QUOTES.length);
    } else {
      next = 0;
    }
    current = next;
    button.textContent = '';
    button.appendChild(document.createTextNode('“' + QUOTES[next][0] + '”'));
    var by = document.createElement('cite');
    by.textContent = '— ' + QUOTES[next][1];
    button.appendChild(by);
  }

  button.addEventListener('click', show);
  show();
})();
