$(document).ready(function() {
    $('svg').css('width', window.innerWidth - 100).css('height', window.innerHeight - 100);
    $.get('/data/references.bib', function(data) {
        $.get('/data/config.json', function(config) {
            processBibTex(data, config);
        });
    });
});

function processBibTex(data, relevantPapers) {

    var bibtex = bibtexParse.toJSON(data);
    var litmap = {};
    var pruned = [];
    for(var idx in bibtex) {
        var item = bibtex[idx];
        var key = item.citationKey; 
        if(relevantPapers[key] != undefined) {
            item.keywords = relevantPapers[key];
            litmap[key] = item;
            pruned.push(item);
        }
    }

    // console.log(litmap);

    var numPapers = pruned.length;
    var offset = 10;
    var xDist = (window.innerWidth - 2 * offset) / numPapers;
    var yDist = (window.innerHeight - 2 * offset) / 2;

    var nodes = [];

    var kwMap = {};
    for(var idx in pruned) {
        var item = pruned[idx];
        for(var kid in item.keywords) {
            var kw = item.keywords[kid];
            if(kwMap[kw] == undefined)
                kwMap[kw] = [];
            kwMap[kw].push(idx);
        }
        nodes.push({
            nodeType    : 'paper',
            name        : item.entryTags.title.replaceAll('{', '').replaceAll('}', ''),
            data        : item,
            x           : offset + idx * xDist,
            y           : offset
        });
    }

    var xDistKW = (window.innerWidth - offset) / Object.keys(kwMap).length;
    var kwOffset = nodes.length;

    var idx = 0;
    for(var kw in kwMap) {
        nodes.push({
            nodeType    : 'concept',
            name        : kw,
            data        : kw,
            x           : offset + idx * xDistKW,
            y           : offset + yDist
        });
        idx++;
    }

    var links = [];
    var idx = 0;
    for(var kw in kwMap) {
        var papers = kwMap[kw];
        papers.sort((a, b) => { parseInt(pruned[a].entryTags.year) - parseInt(pruned[b].entryTags.year) });
        // console.log(papers);
        for(var i = 0; i < papers.length; i++) {
            links.push({
                source: kwOffset + idx,
                target: parseInt(papers[i])
            });
        }
        idx++;
    }

    // console.log(nodes);
    // console.log(links);

    // console.log(window.innerWidth);
    // console.log(window.innerHeight);

    var sim = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force('link', d3.forceLink().links(links))
        .on('tick', function() {
            var v = d3.select('.links')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr("stroke", "black")
                .attr('x1', function(d) {
                    return d.source.x
                })
                .attr('y1', function(d) {
                    return d.source.y
                })
                .attr('x2', function(d) {
                    return d.target.x
                })
                .attr('y2', function(d) {
                    return d.target.y
                });
            var u = d3.select('.nodes')
                .selectAll('circle')
                .data(nodes)
                .join('circle')
                .text(function(d) {
                    return d.name
                })
                .attr('r', function(d) {
                    return (d.nodeType === 'concept') ? 20 : 10;
                })
                .style('fill', function(d) {
                    return (d.nodeType === 'concept') ? 'lightblue' : 'orange';
                })
                .call(node => node.append("title").text(d => d.name))
                // .attr('x', function(d) {
                //     return d.x;
                // })
                // .attr('y', function(d) {
                //     return d.y;
                // })
                // .attr('dy', function(d) {
                //     return 5
                // });
                .attr('cx', function(d) {
                    var x = d.x; 
                    return x;
                })
                .attr('cy', function(d) {
                    var y = d.y;
                    return y;
                });
        });

}