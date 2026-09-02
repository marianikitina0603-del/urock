document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lesson-list a[href*="/lessons/"]').forEach(link => {
    link.target = '_blank';
    link.rel = 'noopener';
  });

  document.querySelectorAll('.lesson-list details').forEach(section => {
    const hasLessonLinks = section.querySelector('a[href*="/lessons/"]') !== null;
    section.open = hasLessonLinks;
  });
});
