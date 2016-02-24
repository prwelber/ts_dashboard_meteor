Meteor.Spinner.options = {
    lines: 13, // The number of lines to draw
    length: 22, // The length of each line
    width: 6, // The line thickness
    radius: 25, // The radius of the inner circle
    corners: 0.7, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000000', // #rgb or #rrggbb
    speed: 1.3, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    // top: 'auto', // Top position relative to parent in px
    // left: 'auto' // Left position relative to parent in px
};
