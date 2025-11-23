/**
 * Agent Decision Framework
 *
 * Provides reasoning, planning, and decision-making capabilities for agents
 */

class AgentDecisionFramework {
  constructor(agentDBService) {
    this.agentDBService = agentDBService;
  }

  /**
   * Make a decision based on context and rules
   * @param {string} agentId - Agent ID
   * @param {Object} context - Decision context
   * @param {Array} rules - Decision rules
   * @returns {Promise<Object>} Decision result
   */
  async makeDecision(agentId, context, rules) {
    console.log(`Agent ${agentId} making decision...`);

    // Retrieve relevant memories
    const memories = await this.agentDBService.retrieveMemories(agentId, 'semantic', 10);

    // Enhance context with memories
    const enhancedContext = {
      ...context,
      past_experiences: memories.map(m => m.memory_content)
    };

    // Evaluate rules
    const evaluations = [];
    for (const rule of rules) {
      const evaluation = this.evaluateRule(rule, enhancedContext);
      evaluations.push({
        rule: rule.name,
        condition: rule.condition,
        result: evaluation.matches,
        action: rule.action,
        priority: rule.priority || 0
      });
    }

    // Find matching rules
    const matchingRules = evaluations.filter(e => e.result);

    if (matchingRules.length === 0) {
      return {
        decision: 'no_match',
        matched_rules: [],
        recommended_action: rules.find(r => r.name === 'default')?.action || 'continue'
      };
    }

    // Sort by priority
    matchingRules.sort((a, b) => b.priority - a.priority);

    // Get highest priority rule
    const selectedRule = matchingRules[0];

    // Store decision in memory
    await this.agentDBService.storeMemory(
      agentId,
      'episodic',
      `decision:${Date.now()}`,
      {
        context: context,
        matched_rules: matchingRules,
        selected_rule: selectedRule,
        timestamp: new Date()
      },
      { importance_score: 0.8 }
    );

    return {
      decision: selectedRule.action,
      matched_rules: matchingRules,
      reasoning: `Selected rule '${selectedRule.rule}' with priority ${selectedRule.priority}`,
      confidence: this.calculateConfidence(matchingRules)
    };
  }

  /**
   * Evaluate a single rule against context
   * @private
   */
  evaluateRule(rule, context) {
    try {
      // Create safe evaluation function
      const evaluator = new Function('context', `
        try {
          return ${rule.condition};
        } catch (e) {
          return false;
        }
      `);

      const matches = evaluator(context);

      return { matches: Boolean(matches) };
    } catch (error) {
      console.error(`Error evaluating rule ${rule.name}:`, error.message);
      return { matches: false };
    }
  }

  /**
   * Calculate confidence score
   * @private
   */
  calculateConfidence(matchingRules) {
    if (matchingRules.length === 0) {
      return 0;
    }

    // Base confidence on number of matching rules and their priorities
    const totalPriority = matchingRules.reduce((sum, r) => sum + r.priority, 0);
    const avgPriority = totalPriority / matchingRules.length;

    const confidence = Math.min(0.5 + (avgPriority / 10) + (matchingRules.length * 0.1), 1.0);

    return confidence;
  }

  /**
   * Plan a sequence of actions to achieve a goal
   * @param {string} agentId - Agent ID
   * @param {Object} currentState - Current state
   * @param {Object} goalState - Desired goal state
   * @param {Array} availableActions - Available actions
   * @returns {Promise<Array>} Action plan
   */
  async planActions(agentId, currentState, goalState, availableActions) {
    console.log(`Agent ${agentId} planning actions to achieve goal...`);

    // Retrieve past successful plans
    const pastPlans = await this.agentDBService.searchMemories(agentId, 'plan:success');

    const plan = [];
    let state = { ...currentState };
    const maxSteps = 10;
    let step = 0;

    while (step < maxSteps && !this.goalAchieved(state, goalState)) {
      // Find best action for current state
      const action = this.selectBestAction(state, goalState, availableActions, pastPlans);

      if (!action) {
        console.log('No suitable action found');
        break;
      }

      plan.push(action);

      // Simulate action effects
      state = this.applyAction(state, action);
      step++;
    }

    if (this.goalAchieved(state, goalState)) {
      // Store successful plan
      await this.agentDBService.storeMemory(
        agentId,
        'semantic',
        'plan:success',
        {
          initial_state: currentState,
          goal_state: goalState,
          plan: plan,
          steps: plan.length,
          timestamp: new Date()
        },
        { importance_score: 0.9 }
      );

      return {
        success: true,
        plan: plan,
        steps: plan.length,
        estimated_success_rate: 0.85
      };
    } else {
      return {
        success: false,
        plan: plan,
        steps: plan.length,
        reason: 'Could not find path to goal'
      };
    }
  }

  /**
   * Check if goal is achieved
   * @private
   */
  goalAchieved(currentState, goalState) {
    for (const key in goalState) {
      if (currentState[key] !== goalState[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Select best action for current state
   * @private
   */
  selectBestAction(state, goalState, availableActions, pastPlans) {
    let bestAction = null;
    let bestScore = -Infinity;

    for (const action of availableActions) {
      // Calculate heuristic score
      const score = this.calculateActionScore(state, goalState, action, pastPlans);

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Calculate action score (heuristic)
   * @private
   */
  calculateActionScore(state, goalState, action, pastPlans) {
    let score = 0;

    // Check if action moves us closer to goal
    const simulatedState = this.applyAction(state, action);

    for (const key in goalState) {
      if (simulatedState[key] === goalState[key]) {
        score += 10;
      }
    }

    // Bonus for actions used in past successful plans
    const usedInPastPlans = pastPlans.some(plan =>
      plan.memory_content.plan?.some(a => a.name === action.name)
    );

    if (usedInPastPlans) {
      score += 5;
    }

    return score;
  }

  /**
   * Apply action to state (simulation)
   * @private
   */
  applyAction(state, action) {
    const newState = { ...state };

    if (action.effects) {
      for (const key in action.effects) {
        newState[key] = action.effects[key];
      }
    }

    return newState;
  }

  /**
   * Learn from experience
   * @param {string} agentId - Agent ID
   * @param {Object} experience - Experience data
   */
  async learn(agentId, experience) {
    const { action, context, outcome, reward } = experience;

    // Store experience as memory
    await this.agentDBService.storeMemory(
      agentId,
      'episodic',
      `experience:${Date.now()}`,
      {
        action: action,
        context: context,
        outcome: outcome,
        reward: reward,
        timestamp: new Date()
      },
      { importance_score: Math.abs(reward) } // Higher reward/penalty = more important
    );

    // Update agent's knowledge
    if (reward > 0.5) {
      // Positive experience - reinforce
      await this.agentDBService.storeMemory(
        agentId,
        'semantic',
        `knowledge:${action}`,
        {
          action: action,
          effective_in: context,
          success_count: 1
        },
        { importance_score: 0.7 }
      );
    }

    console.log(`Agent ${agentId} learned from experience (reward: ${reward})`);
  }

  /**
   * Reason about a situation
   * @param {string} agentId - Agent ID
   * @param {Object} situation - Current situation
   * @param {Array} knownFacts - Known facts
   * @returns {Promise<Object>} Reasoning result
   */
  async reason(agentId, situation, knownFacts = []) {
    // Retrieve relevant semantic memories (knowledge)
    const knowledge = await this.agentDBService.retrieveMemories(agentId, 'semantic', 20);

    const allFacts = [
      ...knownFacts,
      ...knowledge.map(k => k.memory_content)
    ];

    // Apply logical reasoning
    const inferences = this.applyInferences(situation, allFacts);

    // Store reasoning result
    await this.agentDBService.storeMemory(
      agentId,
      'episodic',
      `reasoning:${Date.now()}`,
      {
        situation: situation,
        facts_used: allFacts.length,
        inferences: inferences,
        timestamp: new Date()
      },
      { importance_score: 0.6 }
    );

    return {
      situation: situation,
      inferences: inferences,
      confidence: inferences.length > 0 ? 0.7 : 0.3,
      facts_analyzed: allFacts.length
    };
  }

  /**
   * Apply inference rules
   * @private
   */
  applyInferences(situation, facts) {
    const inferences = [];

    // Simple rule-based inference
    // Example: If content has high manipulation score, infer it's likely fake
    if (situation.manipulation_score > 0.7) {
      inferences.push({
        conclusion: 'Content is likely manipulated',
        confidence: situation.manipulation_score,
        reasoning: 'High manipulation score detected'
      });
    }

    // Check against known facts
    for (const fact of facts) {
      if (fact.pattern && this.matchesPattern(situation, fact.pattern)) {
        inferences.push({
          conclusion: fact.conclusion,
          confidence: fact.confidence || 0.7,
          reasoning: `Matches known pattern: ${fact.pattern_description}`
        });
      }
    }

    return inferences;
  }

  /**
   * Check if situation matches a pattern
   * @private
   */
  matchesPattern(situation, pattern) {
    try {
      const matcher = new Function('situation', `return ${pattern}`);
      return matcher(situation);
    } catch (error) {
      return false;
    }
  }
}

module.exports = AgentDecisionFramework;
