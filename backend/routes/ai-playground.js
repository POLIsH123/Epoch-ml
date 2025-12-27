const express = require('express');
const router = express.Router();

const KNOWLEDGE_BASE = {
    finance: [
        "The market is currently pricing in a 75% chance of a rate cut by late Q2. This optimism is driving capital back into growth sectors.",
        "Technical indicators suggest a period of mean reversion after the recent rally. We are watching the RSI levels closely for overbought signals.",
        "Institutional inflows have reached a record high this quarter, particularly in digital asset products and decentralized finance protocols.",
        "Macro headwinds persist as geopolitical tensions continue to affect energy prices and global supply chain stability."
    ],
    crypto: [
        "Bitcoin is currently exhibiting strong consolidation patterns around the $42,000 - $45,000 range. Following the recent ETF approvals, we are seeing a shift from retail-driven hype to institutional accumulation.",
        "The 200-day moving average remains a key support level for BTC. On-chain metrics suggest a decrease in exchange balances, which typically precedes a supply-side crunch.",
        "Macroeconomic factors such as Fed interest rate decisions continue to exert significant influence on risk-on assets like Bitcoin. Expect volatility in the near term.",
        "Network hashrate has reached an all-time high, indicating robust miner confidence despite the upcoming halving event."
    ],
    code: [
        "The selected architecture relies heavily on asynchronous event loops, which may lead to bottlenecking under high concurrent loads.",
        "Consider implementing a caching layer using Redis to reduce the load on your primary database for frequently accessed read operations.",
        "Your current implementation of the authentication middleware follows best practices, though I recommend adding rate limiting to prevent brute force attacks.",
        "Refactoring the utility functions into a separate package could improve the modularity and testability of the overall system."
    ],
    general: [
        "That is an interesting perspective. When considering the variables at hand, one must balance immediate results with long-term sustainability.",
        "The data points you've mentioned are consistent with current trends. I recommend a multi-faceted approach to address the primary objectives.",
        "While the initial findings are promising, further investigation into the edge cases would be prudent to ensure reliability.",
        "I have analyzed your request and formulated a strategy that maximizes efficiency while minimizing potential risk factors."
    ]
};

router.post('/test', async (req, res) => {
    const { prompt, testInput, modelType } = req.body;

    // Artificial delay to simulate "AI thinking"
    await new Promise(resolve => setTimeout(resolve, 1500));

    let response = "";
    const combined = (prompt + " " + testInput).toLowerCase();

    if (combined.includes("bitcoin") || combined.includes("crypto") || combined.includes("btc") || combined.includes("eth")) {
        response = KNOWLEDGE_BASE.crypto[Math.floor(Math.random() * KNOWLEDGE_BASE.crypto.length)];
    } else if (combined.includes("finance") || combined.includes("stock") || combined.includes("market") || combined.includes("price")) {
        response = KNOWLEDGE_BASE.finance[Math.floor(Math.random() * KNOWLEDGE_BASE.finance.length)];
    } else if (combined.includes("code") || combined.includes("function") || combined.includes("bug") || combined.includes("security")) {
        response = KNOWLEDGE_BASE.code[Math.floor(Math.random() * KNOWLEDGE_BASE.code.length)];
    } else {
        response = KNOWLEDGE_BASE.general[Math.floor(Math.random() * KNOWLEDGE_BASE.general.length)];
    }

    const prefix = `${modelType} Analysis: `;
    res.json({ response: prefix + response });
});

module.exports = router;
