(function () {
    var HEADINGS = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]';

    function contentDetails() {
        return document.querySelectorAll('#post-content details');
    }

    function reveal(id) {
        var target = id && document.getElementById(id);
        var details = target && target.closest('#post-content details');
        if (!details) return null;
        details.open = true;
        return target;
    }

    function linkTarget(link) {
        return decodeURIComponent(link.hash.slice(1));
    }

    function groupSidebarEntries() {
        var toc = document.querySelector('.sidebar .table-of-contents');
        if (!toc) return;

        contentDetails().forEach(function (details) {
            var hidden = new Set();
            details.querySelectorAll(HEADINGS).forEach(function (heading) { hidden.add(heading.id); });

            var entries = Array.prototype.filter.call(toc.children, function (entry) {
                var link = entry.querySelector('a[href*="#"]');
                return link && hidden.has(linkTarget(link));
            });
            if (entries.length === 0) return;

            var group = document.createElement('details');
            group.className = 'toc-details';
            var summary = document.createElement('summary');
            var pageSummary = details.querySelector('summary');
            summary.textContent = pageSummary ? pageSummary.textContent : 'Show more';
            group.appendChild(summary);

            toc.insertBefore(group, entries[0]);
            entries.forEach(function (entry) { group.appendChild(entry); });
        });
    }

    document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('a[href*="#"]');
        if (link && link.pathname === window.location.pathname) reveal(linkTarget(link));
    });

    function revealCurrentHash() {
        var target = reveal(decodeURIComponent(window.location.hash.slice(1)));
        if (target) target.scrollIntoView();
    }

    function init() {
        groupSidebarEntries();
        revealCurrentHash();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    window.addEventListener('hashchange', revealCurrentHash);
})();
