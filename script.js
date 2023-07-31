// ==UserScript==
// @name         JIRA Board Randomize Swimlanes
// @version      1
// @description  Add a Randomize button to JIRA board.
// @author       https://github.com/clintonmonk
// @match        https://*.atlassian.net/jira/software/projects/*/boards/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @grant        none
// ==/UserScript==


/**
 * Whether or not the provided swimlane is the "Unassigned" swimlane.
 */
const isUnassignedSwimlane = (swimlane) => {
  return Array.from(swimlane.querySelectorAll("div"))
  	.reduce(
    	(acc, childDiv) => acc || childDiv.textContent == "Unassigned",
    	false,
    );
}

/**
 * Randomizes the order of the swimlanes. Keeps "Unassigned" at the end.
 */
const randomizeSwimlanes = () => {
  // get swimlanes
  const swimlanes = Array.from(document.querySelectorAll("div[data-test-id='platform-board-kit.ui.swimlane.swimlane-wrapper']"));
  const parentElement = swimlanes[0].parentElement;

  // randomize using vanilla JS
  /**
  const randomizedSwimlanes = swimlanes
    .map(swimlane => ({
      swimlane,
      sort: isUnassignedSwimlane(swimlane) ? 1 : Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ swimlane }) => swimlane);
  **/

  // randomize using lodash
  const randomizedSwimlanes = _.partition(swimlanes, (swimlane) => {return !isUnassignedSwimlane(swimlane)})
    .map(_.shuffle)
    .flat();

  // add to DOM
  const frag = document.createDocumentFragment();
  randomizedSwimlanes.forEach(swimlane => frag.appendChild(swimlane));
  parentElement.appendChild(frag);
}

/**
 * Randomizes a given number of times (for fun!).
 */
const randomizeSwimlanesMultipleTimes = (remaining) => {
  randomizeSwimlanes();

  if (remaining > 0) {
    let timeout;
    if (remaining <= 1) {
      timeout = 370;
    } else if (remaining <= 3) {
      timeout = 200;
    } else if (remaining <= 5) {
      timeout = 90;
    } else {
      timeout = 50;
    }

    setTimeout(
      () => {randomizeSwimlanesMultipleTimes(remaining - 1)},
      timeout
    );
  }
}

/**
 * Find Insights button.
 */
const findInsightsButton = () => {
  // Search for a button with "insights" inside its innerHTML.
  // Previous approach: document.querySelector("button[data-testid='insights-show-insights-button.ui.insights-button']")
  let insightButton = null;
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    const innerHTML = button.innerHTML.toLowerCase();
    if (innerHTML.includes("insights")) {
      insightButton = button;
    }
  });
  console.log("insightButton", insightButton);
  return insightButton;
}

/**
 * Adds a "Randomize" button.
 */
const addRandomizeButton = () => {
  console.log("Adding Randomize button...");

  // copy the Insights button
  const insightButton = findInsightsButton();
  const insightInnerDiv = insightButton.parentElement;
  const insightOuterDiv = insightInnerDiv.parentElement;

  const button = document.createElement("button");
  button.onclick = () => {randomizeSwimlanesMultipleTimes(10)}
  button.className = insightButton.className;
  button.innerHTML = "Randomize";

  const innerDiv = document.createElement("div");
  innerDiv.className = insightInnerDiv.className;
  innerDiv.appendChild(button);

  const outerDiv = document.createElement("div");
  outerDiv.className = insightOuterDiv.className;
  outerDiv.appendChild(innerDiv);

  // add to DOM right before the Insights button
  const parentNode = insightOuterDiv.parentElement;
  parentNode.insertBefore(outerDiv, insightOuterDiv);

  console.log("Randomize button added!");
}

const waitForInsightsButton = (callback, timeRemaining) => {
  const interval = 200;
  const insightButton = findInsightsButton();
  if (insightButton) {
    callback();
  } else if (timeRemaining <= 0) {
    alert("Insight button not found!");
  } else {
    setTimeout(() => {waitForInsightsButton(callback, timeRemaining - interval)}, interval);
  }
}

(function() {
  'use strict';
  waitForInsightsButton(addRandomizeButton, 2000);
})();
