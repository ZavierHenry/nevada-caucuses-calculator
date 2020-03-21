QUnit.helpers(this);

function doGet(e) {
  QUnit.urlParams(e.parameter)
  QUnit.config({ 
    title: "Unit tests for Nevada Caucus Scripts",
    hidepassed: true
  })
  QUnit.load(myTests)
  
  return QUnit.getHtml()
}

function delegateVotesTests() {
  QUnit.test("Tests for DELEGATEVOTES function", 6, function() {
    equal(DELEGATEVOTES(10666, 440), 9, "Carson City 101 should have 9 delegates")
    equal(DELEGATEVOTES(528661, 1408), 28, "Clark 2752 should have 28 delegates")
    equal(DELEGATEVOTES(104, 44), 8, "Esmeralda 1 should have 8 delegates")
    equal(DELEGATEVOTES(1737, 186), 9, "Humboldt 1 should have 9 delegates")
    equal(DELEGATEVOTES(519, 119), 14, "Lander 5 should have 14 delegates")
    equal(DELEGATEVOTES(893, 87), 5, "Mineral 5 should have 5 delegates")
  })
}

function viabilityThresholdTests() {
  QUnit.test("Tests for VIABILITYTHRESHOLD function", 5, function() {
    equal(VIABILITYTHRESHOLD([[.43], [.20], [.20], [.17], [0], [0]], 6), 0.15, "Standard viability threshold of 15 percent")
    equal(VIABILITYTHRESHOLD([[.60], [.4], [0], [0], [0]], 1), 0.5, "Viability threshold should be a majority if only 1 delegate is allocated")
    equal(VIABILITYTHRESHOLD([[.60], [.4], [0], [0], [0]], 2), 0.25, "Viability threshold should be 25% if 2 delegates are allocated")
    equal(VIABILITYTHRESHOLD([[.60], [.4], [0], [0], [0]], 3), 1/6, "Viability threshold should be 1/6 if 3 delegates are allocated")
    equal(VIABILITYTHRESHOLD([[.14], [.10], [.10], [.10], [.10], [.10], [.10], [.10], [.10], [.06]], 9), .07, "Viability threshold should be 1/2 the top percentage if no candidate is greater than the initial threshold (15% in this example)")
  })
}

function cardGreaterThan(name1, name2, message) {
  ok(cardcmp_(toCard_(name1), toCard_(name2)) < 0, message)
}

function cardZero(name1, name2, message) {
  ok(cardcmp_(toCard_(name1), toCard_(name2)) == 0, message)
}


function cardRankTests() {
  QUnit.test("Tests for ranking cards", 8, function () {
    cardGreaterThan('ace of spades', '4 of spades', "Ace is a high card")
    cardGreaterThan('7 of spades', '7 of hearts', "Spades is a higher suit than hearts")
    cardGreaterThan('queen of clubs', '9 of clubs', "Face cards are higher than number cards")
    cardGreaterThan('8 of clubs', '2 of hearts', "Rank determines high card before suit")
    cardZero('8 of clubs', '10 of stars', "Unknown card results in a zero comparison")
    cardGreaterThan('10 of hearts', '10 of diamonds', "Hearts is a higher suit than diamonds")
    cardGreaterThan('4 of diamonds', '4 of clubs', "Diamonds is a higher suit than clubs")
    cardZero('9 of spades', '9 of spades', "Equal cards have a zero comparison")
  })
}

function majorityElectionDelegatesTests() {
  QUnit.test("Tests for MAJORITYELECTIONDELEGATES function", 3, function () {
    deepEqual(MAJORITYELECTIONDELEGATES([[14], [18], [5], [0], [0]], [[null], [null], [null], [null], [null]]), [[0], [1], [0], [0], [0]], "Basic majority election")
    deepEqual(MAJORITYELECTIONDELEGATES([[22], [18], [5], [22], [0]], [['3 of diamonds'], [null], [null], ['7 of hearts'], [null]]), [[0], [0], [0], [1], [0]], "Majority election with tiebreaker")
    deepEqual(MAJORITYELECTIONDELEGATES([[22], [18], [5], [22], [0]], [[null], [null], [null], [null], [null]]), [[null], [0], [0], [null], [0]], "Majority election without needed tiebreaker info")
  })
}

/*
 * Examples used for this test can be found at https://nvdems.com/wp-content/uploads/2020/02/Caucus-Memo_-Delegate-Count-Scenarios-and-Tie-Breakers.pdf
 *
 */
function reconcileDelegatesTests() {
  QUnit.test("Tests for RECONCILEDELEGATES function", 10, function () {
    deepEqual(RECONCILEDELEGATES([[1.2405], [1.6835], [1.5949], [1.0632], [1.4177]], 7, [[null], [null], [null], [null], [null]]), [[1], [2], [2], [1], [1]], "Principle 1, Example A of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[1.8461], [0.9230], [1.1538], [1.1538], [0.9230]], 6, [[null], [null], [null], [null], [null]]), [[2], [1], [1], [1], [1]], "Principle 1, Example B of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[0.6842], [0.6842], [0.6842], [0.6842], [1.2632]], 4, [[null], [null], [null], [null], [null]]), [[1], [1], [1], [1], [1]], "Principle 2, Example A of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[0.821918], [0.958904], [1.506849], [1.712329], [0]], 5, [[null], [null], [null], [null], [null]]), [[1], [1], [1], [2], [0]], "Principle 2, Example B of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[2.2800], [1.4400], [1.3200], [0.9600], [0]], 6, [[null], [null], [null], [null], [null]]), [[2], [2], [1], [1], [0]], "Principle 3, Example A of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[0], [0], [0], [3.0667], [3.6000]], 10, [[null], [null], [null], [null], [null]]), [[0], [0], [0], [5], [5]], "Principle 3, Example B of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[0], [1.6667], [1.6667], [1.6667], [0]], 5, [[null], ['10 of clubs'], ['king of hearts'], ['queen of diamonds'], [null]]), [[0], [1], [2], [2], [0]], "Principle 4, Example A of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[0], [0], [2.5], [2.5], [0]], 5, [[null], [null], ['7 of clubs'], ['7 of spades'], [null]]), [[0], [0], [2], [3], [0]], "Principle 4, Example B of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[1.2], [3.6], [1.6], [1.6], [0]], 8, [[null], ['10 of clubs'], ['queen of diamonds'], ['king of hearts'], [null]]), [[1], [3], [2], [2], [0]], "Principle 4, Example C of the given Nevada caucuses examples")
    deepEqual(RECONCILEDELEGATES([[1.2], [3.6], [1.6], [1.6], [0]], 8, [[null], [null], [null], [null], [null]]), [[1], [null], [null], [null], [0]], "Principle 4, Example C of the given Nevada caucuses examples without tiebreaker info")
  })
}


function myTests() {
  console = Logger;
  delegateVotesTests()
  viabilityThresholdTests()
  cardRankTests()
  majorityElectionDelegatesTests()
  reconcileDelegatesTests()
}

