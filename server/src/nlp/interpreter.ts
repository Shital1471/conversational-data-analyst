import type { DatabaseSync } from 'node:sqlite';
import type { ChatResponse } from '../types/index.js';
import { SUPPORTED_INTENTS, type IntentDefinition } from './intents.js';
import { QUERY_TEMPLATES } from './queryTemplates.js';

export interface InterpretationMatch {
  intent: IntentDefinition;
  confidence: number;
  matchedBy: 'pattern' | 'keywords';
}

export class QueryInterpreter {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  /**
   * Deterministically interprets a natural-language banking query,
   * maps it to an audited safe SQL query template, and executes it.
   */
  public processQuery(rawQuestion: string): ChatResponse {
    const cleaned = rawQuestion.trim();

    if (!cleaned) {
      return this.generateUnsupportedResponse(
        'Please provide a question about onboarding applications, customer segments, branches, or transactions.'
      );
    }

    const match = this.identifyIntent(cleaned);

    if (!match || match.confidence < 0.4) {
      return this.generateUnsupportedResponse(
        `I couldn't map "${cleaned}" to an approved analytical report. The banking analytics engine currently supports questions regarding onboarding volumes, customer segments, branch rejection/approval rates, top customers, and transaction trends.`
      );
    }

    const template = QUERY_TEMPLATES[match.intent.id];
    if (!template) {
      return this.generateUnsupportedResponse(
        `Analysis template for "${match.intent.name}" is currently under maintenance.`
      );
    }

    try {
      const response = template.execute(this.db, cleaned);
      // Attach suggested follow-up questions
      response.suggestedQuestions = this.getRelatedQuestions(match.intent.id);
      return response;
    } catch (error) {
      console.error('Error executing analytical query template:', error);
      return {
        success: false,
        message: 'An error occurred while executing the analytical query against the database.',
        intent: match.intent.id,
        visualizationType: 'none',
        summary: 'Database execution failed. The query was rejected or could not be completed.',
        columns: [],
        rows: [],
        suggestedQuestions: [
          'Show monthly onboarding applications by customer segment',
          'Which branches have the highest rejection rate?',
          'What is the total transaction value this month?'
        ]
      };
    }
  }

  /**
   * Scores and matches the user query against the intent catalog.
   */
  public identifyIntent(question: string): InterpretationMatch | null {
    const normalized = question.toLowerCase();

    // 1. Direct Pattern Matching (High confidence)
    for (const intent of SUPPORTED_INTENTS) {
      for (const pattern of intent.patterns) {
        if (pattern.test(normalized)) {
          return {
            intent,
            confidence: 0.95,
            matchedBy: 'pattern',
          };
        }
      }
    }

    // 2. Keyword & Token Scoring (Fuzzy matching)
    const words = normalized.split(/\W+/).filter(w => w.length > 2);
    let bestIntent: IntentDefinition | null = null;
    let highestScore = 0;

    for (const intent of SUPPORTED_INTENTS) {
      let score = 0;
      for (const kw of intent.keywords) {
        const lowerKw = kw.toLowerCase();
        if (normalized.includes(lowerKw)) {
          score += lowerKw.split(/\s+/).length * 2.0;
        }
      }

      for (const word of words) {
        if (intent.keywords.some(kw => kw.toLowerCase().includes(word))) {
          score += 0.5;
        }
      }

      // Normalize by keyword count
      const normalizedScore = score / (intent.keywords.length + 2);
      if (normalizedScore > highestScore) {
        highestScore = normalizedScore;
        bestIntent = intent;
      }
    }

    if (bestIntent && highestScore >= 0.4) {
      return {
        intent: bestIntent,
        confidence: Math.min(highestScore, 0.9),
        matchedBy: 'keywords',
      };
    }

    return null;
  }

  private generateUnsupportedResponse(explanation: string): ChatResponse {
    return {
      success: false,
      message: explanation,
      intent: 'unsupported',
      visualizationType: 'none',
      summary: explanation,
      columns: [],
      rows: [],
      suggestedQuestions: [
        'Show monthly onboarding applications by customer segment',
        'Which branches have the highest rejection rate?',
        'Compare retail and SME onboarding volumes',
        'Show the top five customers by transaction value',
        'What is the total transaction value this month?',
        'Show the application approval rate by branch',
        'Show transaction value over time',
        'Show application volume by branch'
      ],
    };
  }

  private getRelatedQuestions(currentIntentId: string): string[] {
    const allSuggestions = [
      'Show monthly onboarding applications by customer segment',
      'Which branches have the highest rejection rate?',
      'Compare retail and SME onboarding volumes',
      'Show the top five customers by transaction value',
      'What is the total transaction value this month?',
      'Show the application approval rate by branch',
      'Show transaction value over time',
      'Show application volume by branch',
      'Show application status distribution'
    ];

    // Filter out the current intent's primary question
    return allSuggestions
      .filter(q => {
        const match = this.identifyIntent(q);
        return match?.intent.id !== currentIntentId;
      })
      .slice(0, 4);
  }
}
