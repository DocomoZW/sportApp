import { U17_RULES, U18_U20_RULES } from '../complianceRules';
import { Sport, Session, SportCategoryName } from '../types';

// Mock data - simplified, only category and id are relevant for these validators
const createMockSport = (id: string, category: SportCategoryName): Sport => ({
  id,
  name: `Sport ${id}`,
  category,
  categoryId: `cat-${category.toLowerCase()}`,
  Icon: undefined, // Not used by validator
  // Add other SportFirebaseData fields if necessary for future, more complex validators
  dataAiHint: '',
  staff: [],
  location: '',
  maxCapacity: 0,
  description: '',
});

const mockRedSport1: Sport = createMockSport('red1', 'Red');
const mockRedSport2: Sport = createMockSport('red2', 'Red');
const mockGreenSport1: Sport = createMockSport('green1', 'Green');
const mockGreenSport2: Sport = createMockSport('green2', 'Green');
const mockBlueSport1: Sport = createMockSport('blue1', 'Blue');
const mockBlueSport2: Sport = createMockSport('blue2', 'Blue');
const mockYellowSport1: Sport = createMockSport('yellow1', 'Yellow');

const mockSessions: Session[] = []; // Not used by current custom validators, but passed in

describe('Compliance Rules Custom Validators', () => {
  describe('U17_RULES Custom Validator', () => {
    const validator = U17_RULES.customRuleValidator;

    it('should be compliant with 1 Red and 2 Green sports', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockGreenSport1, mockGreenSport2];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });

    it('should be compliant with 1 Red, 1 Green, and 1 Blue sport', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockGreenSport1, mockBlueSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });

    it('should be non-compliant with 0 Red sports', () => {
      const selectedSports: Sport[] = [mockGreenSport1, mockGreenSport2];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(false);
      expect(result.message).toContain("Requires at least 1 Red sport.");
    });

    it('should be non-compliant with 1 Red and 1 Green sport (needs 2 from Green/Blue)', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockGreenSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(false);
      expect(result.message).toContain("Requires at least 2 additional activities from Green or Blue.");
    });
  });

  describe('U18_U20_RULES Custom Validator', () => {
    const validator = U18_U20_RULES.customRuleValidator;

    it('should be compliant with 1 Red and 2 Green sports', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockGreenSport1, mockGreenSport2];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });

    it('should be compliant with 1 Blue and 2 Yellow sports', () => {
      const selectedSports: Sport[] = [mockBlueSport1, mockYellowSport1, mockGreenSport1]; // Using Green as another 'other'
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });
    
    it('should be compliant with 1 Red, 1 Blue, 1 Green (Red as primary, Blue+Green as others)', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockBlueSport1, mockGreenSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });
    
    it('should be compliant with 2 Red, 1 Green (1 Red as primary, 1 Red + 1 Green as others)', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockRedSport2, mockGreenSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(true);
    });

    it('should be non-compliant with 0 Red and 0 Blue sports', () => {
      const selectedSports: Sport[] = [mockGreenSport1, mockYellowSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(false);
      expect(result.message).toContain("Requires at least 1 Red OR 1 Blue sport.");
    });

    it('should be non-compliant with 1 Red and 1 Green sport (needs 2 others)', () => {
      const selectedSports: Sport[] = [mockRedSport1, mockGreenSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(false);
      expect(result.message).toContain("Requires 2 other activities");
    });
    
    it('should be non-compliant with 1 Red and 0 other sports', () => {
      const selectedSports: Sport[] = [mockRedSport1];
      const result = validator!(selectedSports, mockSessions);
      expect(result.compliant).toBe(false);
      expect(result.message).toContain("Requires 2 other activities");
    });
  });
});
