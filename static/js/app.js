$(document).ready(function() {
    var relevantPapers = ["thoppe_stochastic_2014"];
    $.get('/data/references.bib', function(data) {
        processBibTex(data, relevantPapers);
    });
});

function processBibTex(data, relevantPapers) {

    var bibtex = bibtexParse.toJSON(data);
    var litmap = {};
    var pruned = [];
    for(var idx in bibtex) {
        var item = bibtex[idx];
        var key = item.citationKey;
        item.keywords = [item.entryTags.year]; // TODO hack
        if(relevantPapers.includes(key)) {
            litmap[key] = item;
            pruned.push(item);
        }
    }

    console.log(litmap);
    pruned = bibtex;

    var kwMap = {};
    for(var idx in pruned) {
        var item = pruned[idx];
        for(var kw in item.keywords) {
            if(kwMap[kw] == undefined)
                kwMap[kw] = [];
            kwMap[kw].push(idx);
        }
    }

    var links = [];
    for(var kw in kwMap) {
        var papers = kwMap[kw];
        papers.sort((a, b) => { parseInt(pruned[a].entryTags.year) - parseInt(pruned[b].entryTags.year) });
        for(var i = 1; i < papers.length; i++) {
            links.push({
                source: 0,
                target: i
            });
        }
    }

    var xOffset = 100, yOffset = 100, yStep = 10, yMax = 100;

    var sim = d3.forceSimulation(pruned)
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force('link', d3.forceLink().links(links))
        .on('tick', function() {
            var idx = 0;
            var u = d3.select('svg')
                .selectAll('circle')
                .data(pruned)
                .join('circle')
                .attr('r', 5)
                .attr('cx', function(d) {
                    var x = parseInt(d.entryTags.year) - 1900 + xOffset; 
                    return x;
                })
                .attr('cy', function(d) {
                    var y = (idx + yStep) % yMax + yOffset;
                    return y;
                });
        });
}