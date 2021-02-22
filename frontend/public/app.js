// TODO: break this down in modules
// change address here if necessary
const wssAddress = 'ws://127.0.0.1:8081';

// Bar Chart 
// https://www.d3-graph-gallery.com/graph/barplot_button_data_simple.html
const initBarChart = (voteOptions) => {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 0, bottom: 35, left: 60 };
    const parent = document.getElementById("barChart");
    const width = parent.clientWidth - margin.left - margin.right;
    const height = parent.clientHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(voteOptions)
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0])
    //configure ticks to only show full integers
    const yAxisTicks = y.ticks()
        .filter(tick => Number.isInteger(tick));
    svg.append("g")
        .attr("class", "myYaxis")
        .call(d3.axisLeft(y)
            .tickValues(yAxisTicks)
            .tickFormat(d3.format('d')));

    //update function for new vote state
    const updateBarChart = (data) => {
        // restructure data for d3
        if (data)
            data = voteOptions.map(option => { return { group: option, value: data[option] || 0 } })
        else
            data = barChart.selectAll("rect").data(); //part 2 update scaling hack

        // update magic
        const u = barChart.selectAll("rect")
            .data(data)

        u
            .enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(d.group); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", "#0f8bc9")
    }

    // rescale function if users join or leave session
    const rescale = () => {
        y.domain([0, userCount])
        // do the ticks again
        const yAxisTicks = y.ticks()
            .filter(tick => Number.isInteger(tick));

        // update
        svg.select(".myYaxis")
            .transition().duration(1500)
            .call(d3.axisLeft(y).tickValues(yAxisTicks)
                .tickFormat(d3.format('d')));

        // hack to reload data for scaling
        // else only axis would rescale
        updateBarChart();
    }

    return [svg, updateBarChart, rescale]
}

// Progress Chart
// https://codepen.io/zakariachowdhury/pen/xgabbG?__cf_chl_captcha_tk__=14d2520598576752cc450e6897335179efd60c72-1614007589-0-AUH_Vzk5pBP761JnlhVc9aXfGaMmYgalEquZ-ZHfCS2bJMjwX_8cUTnWD6-VPI4qRtnwvHfbrSok0AwdIINhvZI2bZwemW0zC5EahNcN5ENJdSt2TMuo25bMexCXkG2zYwJltMg3V0j8LsL-5XRMjzdijVGzYwqcv4U9KKgGpFheLPTlAfQngrsbc8UL6vIIDebK_ThFYUUnwRHv7khiZcD7DqWrI_X_EthV1U5BUwJ2sh0PglYzQ2NJz3RsnDY13MwAqAE0KfemrjZ1nzAmbjQ-Xgrqs6-TnS-dtetRSf9HzS795v4tVdgFzlm8O4eMcKq8vWxq81n4b0By_SXEYj8qsEBY9y7h3A_MJkkZwBxLaIeBY164--bDvjn-4EdTWTPRSC6gAAp3kcd88C80VxePybIp7IPf6WpFH8TiuFZ1KM9nPKkiCKILKOeipk4g9R2A_N_nWGh2NiUgIIvx_ZqgHgA9G0qSKFWtzP8jNDqNQT9i223FjMCI3bB7Amiy8QoIyLo6cOje50t-Ay35Z86UK9XmbIa-c-C3BGKvTOtSqpWrXc6bBEL6DgzYFi88SjRqklRNYQ8fZM4EMhO0gkmESAxdcIqqVovFF7zTfapWDcqvf6OvlUOMGB9WzcXDqQ
const initProgressChart = () => {
    // initial state
    const percent = 0; // 0.0 to 1.0
    const text = "0/0";

    // set dimensions and color
    const width = 260;
    const height = 260;
    const thickness = 30;
    const duration = 750;
    const foregroundColor = "#003366";
    const backgroundColor = "#ccc";

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal([foregroundColor, backgroundColor]);

    const svg = d3.select("#progress")
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    const arc = d3.arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

    const pie = d3.pie()
        .sort(null);

    const path = g.selectAll('path')
        .data(pie([0, 1]))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return color(i);
        })
        .each(function (d) { this._current = d; });


    path.data(pie([percent, 1 - percent])).transition()
        .duration(duration)
        .attrTween('d', function (d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                return arc(interpolate(t));
            }
        });

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(text);

    // update function
    const updateProgressChart = () => {
        // update text
        progressChart.select("text").text(`${voteCount}/${userCount}`);

        // update chart
        const percent = voteCount / userCount;
        progressChart.selectAll("path").data(pie([percent, 1 - percent])).transition()
            .duration(750)
            .attrTween('d', function (d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                }
            });
    }

    return [svg, updateProgressChart];
}

// static voting options
// TODO: make them configurable
const voteOptions = [0, 0.5, 1, 2, 3, 5, 8, 13];

// init state
let inSession = false;
let owner = false;
let userCount = 0;
let voteCount = 0;
let ws;

// get all my elemnts
const createButton = document.getElementById('createButton');
const sessionInput = document.getElementById('sessionInput');
const taskInput = document.getElementById('task');
const votingArea = document.getElementById('voting');
const average = document.getElementById('average');
const median = document.getElementById('median');
const averageLabel = document.getElementById('averageLabel');
const medianLabel = document.getElementById('medianLabel');

// init bar chart
const [barChart, updateBarChart, rescaleBarChart] = initBarChart(voteOptions);

// init progress chart
const [progressChart, updateProgressChart] = initProgressChart();

// function to send vote to backend
const onVoteChange = (data) => {
    ws.send(JSON.stringify({ command: "castVote", payload: data.currentTarget.value }));
};

// function to add vote button to voteArea
const addVoteButton = (val) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.id = "radio" + val;
    input.name = "radioVote";
    input.value = val;
    input.addEventListener('change', onVoteChange);
    const label = document.createElement("label");
    label.setAttribute("for", "radio" + val);
    label.textContent = val;
    votingArea.appendChild(input);
    votingArea.appendChild(label);
}

// add button to retract vote
addVoteButton("Nope");
// add buttons for all options
voteOptions.forEach(option => addVoteButton(option));

// refresh function for UI elements
const refreshUI = () => {

    if (!inSession) {
        //update button
        //TODO: check if session exists before allowing user to click join button
        if (sessionInput.value) createButton.textContent = "Join Session";
        else createButton.textContent = "Create Session";

        // enable session input
        sessionInput.disabled = false;

        // hide charts
        progressChart._groups[0][0].setAttribute("visibility", "hidden");
        barChart._groups[0][0].setAttribute("visibility", "hidden");

        // hide session elements
        // TODO: Use something to group the elements
        taskInput.hidden = true;
        votingArea.hidden = true;
        average.hidden = true;
        median.hidden = true;
        averageLabel.hidden = true;
        medianLabel.hidden = true;

        // reset session state
        voteCount = 0;
        userCount = 0;

        // empty charts
        updateBarChart({});
        updateProgressChart();

        // deselect vote
        [...votingArea.children].filter(c => c.checked).forEach(c => c.checked = false);

        // delete task
        taskInput.value = "";

    } else {
        // disable session input
        sessionInput.disabled = true;
        createButton.textContent = "Leave Session";

        // show charts
        progressChart._groups[0][0].setAttribute("visibility", "visible");
        barChart._groups[0][0].setAttribute("visibility", "visible");

        // show session elements
        taskInput.hidden = false;
        votingArea.hidden = false;
        average.hidden = false;
        median.hidden = false;
        averageLabel.hidden = false;
        medianLabel.hidden = false;

        // allow task to be edited as owner
        if (owner) {
            taskInput.classList.remove("fakeLabel");
            taskInput.disabled = false;
        } else {
            taskInput.classList.add("fakeLabel");
            taskInput.disabled = true;
        }
    }
}
// calc median function
//https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-88.php
const calcMedian = arr => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

// init websockets
const initWs = () => {
    ws = new WebSocket(wssAddress);

    // update app when ws connects
    ws.onopen = function () {
        document.getElementById('connectionDot').setAttribute("fill", "#228B22");
        createButton.disabled = false;
        refreshUI();
    };

    // update app when ws drops and try to reconnect
    // TODO: slow down reconnects after an initial time period
    ws.onclose = function () {
        inSession = false;
        document.getElementById('connectionDot').setAttribute("fill", "red");
        sessionInput.value = "";
        createButton.disabled = true;
        refreshUI();
        setTimeout(initWs, 600);
    };

    // handle incomming messages
    ws.onmessage = (message) => {
        //TODO: validate and sanitize
        const info = JSON.parse(message.data);

        switch (info.type) {
            case "sessionId":
                inSession = !!info.payload; // update session state
                // update UI
                sessionInput.value = info.payload || "";
                refreshUI();
                break;

            case "sessionMeta":
                // update state
                owner = info.payload.owner;
                userCount = info.payload.userCount;
                // update UI
                updateProgressChart();
                rescaleBarChart();
                refreshUI();
                break;

            case "votes":
                // update state
                voteCount = Object.values(info.payload).reduce((acc, cur) => acc + cur, 0);
                // update UI
                updateBarChart(info.payload);
                updateProgressChart();
                let voteArray = [];
                for (const [key, value] of Object.entries(info.payload)) {
                    for (i = 0; i < value; i++) {
                        voteArray.push(parseFloat(key));
                    }
                }
                // update aggregates
                average.textContent = voteArray.reduce((acc, cur) => acc + cur, 0) / voteCount || 0;
                median.textContent = calcMedian(voteArray) || 0;
                break;

            case "task":
                // update task this is super unsave
                taskInput.value = info.payload;// UNSAFE
                break;
        }
    }
    return ws;
}
ws = initWs();

// button handler for create button
createButton.onclick = () => {
    // debounce for usability
    createButton.disabled = true;
    setTimeout(() => { createButton.disabled = false }, 250);

    //command depending on state
    if (inSession) {
        ws.send(JSON.stringify({ command: "leaveSession" }))
    } else {
        if (sessionInput.value) {
            ws.send(JSON.stringify({ command: "joinSession", payload: sessionInput.value }))
        } else {
            ws.send(JSON.stringify({ command: "createSession" }));
        }
    }
};

// react to input in sessionfield
sessionInput.addEventListener('input', (input) => {
    refreshUI();
});

// update backend on every change to task
taskInput.addEventListener('input', (input) => {
    ws.send(JSON.stringify({ command: "taskUpdate", payload: input.currentTarget.value }))
});
