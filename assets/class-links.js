document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lesson-list a[href*="/lessons/"]').forEach(link => {
    link.target = '_blank';
    link.rel = 'noopener';
  });
});
