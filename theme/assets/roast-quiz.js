(function () {
  'use strict';

  var forms = document.querySelectorAll('[data-roast-quiz-form]');

  forms.forEach(function (form) {
    var resultsEl = form.parentElement.querySelector('[data-roast-quiz-results]');
    var apiUrl = form.dataset.apiUrl;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runQuiz(form, resultsEl, apiUrl);
    });
  });

  function getAnswers(form) {
    var data = new FormData(form);
    return {
      flavor: data.get('flavor'),
      strength: data.get('strength'),
      caffeine: data.get('caffeine')
    };
  }

  function runQuiz(form, resultsEl, apiUrl) {
    resultsEl.hidden = false;
    resultsEl.innerHTML =
      '<p class="roast-quiz__status">Brewing your matches… (the recommender API is on a free tier and may take up to 30s to wake up on first use)</p>';

    var answers = getAnswers(form);

    fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    }, 45000)
      .then(function (response) {
        if (!response.ok) throw new Error('Bad response: ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var matches = (data && data.matches) || [];
        if (!matches.length) {
          resultsEl.innerHTML = '<p class="roast-quiz__status">No matches found — try different answers.</p>';
          return;
        }
        return renderMatches(resultsEl, matches);
      })
      .catch(function (err) {
        console.error('Roast quiz error:', err);
        resultsEl.innerHTML =
          '<p class="roast-quiz__status">Sorry, recommendations are temporarily unavailable. Please try again in a moment.</p>';
      });
  }

  function renderMatches(resultsEl, matches) {
    return Promise.all(
      matches.map(function (match) {
        return fetch('/products/' + match.handle + '.js')
          .then(function (res) {
            if (!res.ok) return null;
            return res.json();
          })
          .then(function (product) {
            if (!product) return null;
            return { product: product, reason: match.reason };
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (results) {
      var cards = results.filter(Boolean);
      if (!cards.length) {
        resultsEl.innerHTML =
          '<p class="roast-quiz__status">Your matches aren\'t in the catalog yet — add the demo products and try again.</p>';
        return;
      }
      resultsEl.innerHTML = cards.map(cardHtml).join('');
    });
  }

  function cardHtml(entry) {
    var product = entry.product;
    var image = product.featured_image || (product.images && product.images[0]) || '';
    var price = formatMoney(product.price);
    return (
      '<div class="roast-quiz__result-card">' +
      (image ? '<img src="' + image + '" alt="' + escapeHtml(product.title) + '" loading="lazy">' : '') +
      '<h3>' + escapeHtml(product.title) + '</h3>' +
      (entry.reason ? '<p>' + escapeHtml(entry.reason) + '</p>' : '') +
      '<p>' + price + '</p>' +
      '<a class="button button--secondary" href="/products/' + product.handle + '">View product</a>' +
      '</div>'
    );
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
      fetch(url, options),
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error('Request timed out'));
        }, timeout);
      })
    ]);
  }
})();
