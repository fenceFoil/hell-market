function getY(max, height, diff, value) {
    return parseFloat((height - (value * height / max) + diff).toFixed(2));
  }
  
  function removeChildren(svg) {
    [...svg.querySelectorAll("*")].forEach(element => svg.removeChild(element));
  }
  
  function defaultFetch(entry) {
    return entry.value;
  }
  
  function buildElement(tag, attrs) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  
    for (let name in attrs) {
      element.setAttribute(name, attrs[name]);
    }
  
    return element;
  }
  
  function sparkline(svg, entries, options) {
    removeChildren(svg);
  
    if (entries.length <= 1) {
      return;
    }
  
    options = options || {};
  
    if (typeof(entries[0]) === "number") {
      entries = entries.map(entry => {
        return {value: entry};
      });
    }
  
    // Get the stroke width; this is used to compute the
    // rendering offset.
    const strokeWidth = parseFloat(svg.attributes["stroke-width"].value);
  
    // By default, data must be formatted as an array of numbers or
    // an array of objects with the value key (like `[{value: 1}]`).
    // You can set a custom function to return data for a different
    // data structure.
    const fetch = options.fetch || defaultFetch;
  
    // Retrieve only values, easing the find for the maximum value.
    const values = entries.map(entry => fetch(entry));
  
    // The rendering width will account for the spot size.
    const width = parseFloat(svg.attributes.width.value);
  
    // Get the SVG element's full height.
    // This is used
    const fullHeight = parseFloat(svg.attributes.height.value);
  
    // The rendering height accounts for stroke width and spot size.
    const height = fullHeight - (strokeWidth * 2) ;
  
    // The maximum value. This is used to calculate the Y coord of
    // each sparkline datapoint.
    const max = Math.max(...values);
  
    // Cache the last item index.
    const lastItemIndex = Math.max(50, values.length - 1);
  
    // Calculate the X coord base step.
    const offset = width / lastItemIndex;
  
    // Hold all datapoints, which is whatever we got as the entry plus
    // x/y coords and the index.
    const datapoints = [];
  
    // Hold the line coordinates.
    const pathY = getY(max, height, strokeWidth, values[0]);
    let pathCoords = `M0 ${pathY}`;
  
    values.forEach((value, index) => {
      const x = index * offset;
      const y = getY(max, height, strokeWidth, value);
  
      datapoints.push(Object.assign({}, entries[index], {
        index: index,
        x: x,
        y: y
      }));
  
      pathCoords += ` L ${x} ${y}`;
    });
  
    const path = buildElement("path", {
      class: "sparkline--line",
      d: pathCoords,
      fill: "none"
    });
  
    let fillCoords = `${pathCoords} V ${fullHeight} L 0 ${fullHeight} Z`;
  
    const fill = buildElement("path", {
      class: "sparkline--fill",
      d: fillCoords,
      stroke: "none"
    });
  
    svg.appendChild(fill);
    svg.appendChild(path);
  }
  