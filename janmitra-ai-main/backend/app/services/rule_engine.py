import json
import logging
from typing import List, Dict, Any, Tuple
from app.models import Profile, EligibilityRule
from app.schemas import RuleMatchStatus

logger = logging.getLogger("rule_engine")

def evaluate_rule(profile: Profile, rule: EligibilityRule) -> Tuple[bool, str]:
    """
    Evaluates a single eligibility rule against the citizen's profile.
    Returns:
        (passed: bool, message: str)
    """
    field = rule.field_name
    operator = rule.operator
    rule_val_str = rule.rule_value
    err_msg = rule.error_message or f"Failed rule for {field}"
    
    # Get the value from the profile
    if not hasattr(profile, field):
        return False, f"Profile attribute '{field}' does not exist."
    
    profile_val = getattr(profile, field)
    
    # If the profile value is None, check if rule requires empty or not
    if profile_val is None:
        # Default behavior: if field is missing, fail the rule unless it's a negative check
        if operator == "NOT IN" or (operator == "=" and rule_val_str.lower() == "none"):
            return True, ""
        return False, f"Profile lacks information for '{field}'."
    
    try:
        # --- Operator evaluation ---
        if operator in (">=", "<=", ">", "<"):
            # Numeric comparisons
            p_val = float(profile_val)
            r_val = float(rule_val_str)
            
            if operator == ">=":
                passed = p_val >= r_val
            elif operator == "<=":
                passed = p_val <= r_val
            elif operator == ">":
                passed = p_val > r_val
            else: # "<"
                passed = p_val < r_val
                
        elif operator == "=":
            # String or boolean equality check
            if isinstance(profile_val, bool):
                r_val = rule_val_str.lower() == "true"
                passed = profile_val == r_val
            else:
                passed = str(profile_val).strip().lower() == rule_val_str.strip().lower()
                
        elif operator in ("IN", "NOT IN"):
            # Membership comparisons (value is JSON list, e.g. ["SC", "ST"])
            try:
                allowed_values = json.loads(rule_val_str)
                if not isinstance(allowed_values, list):
                    allowed_values = [allowed_values]
            except json.JSONDecodeError:
                # Fallback to comma separated parsing
                allowed_values = [v.strip().lower() for v in rule_val_str.split(",")]
                
            p_val_str = str(profile_val).strip().lower()
            allowed_values_lower = [str(v).strip().lower() for v in allowed_values]
            
            if operator == "IN":
                passed = p_val_str in allowed_values_lower
            else: # NOT IN
                passed = p_val_str not in allowed_values_lower
                
        elif operator == "BOOLEAN":
            # Boolean flag check
            r_val = rule_val_str.lower() == "true"
            passed = bool(profile_val) == r_val
            
        else:
            logger.error(f"Unknown operator '{operator}' in rule ID: {rule.id}")
            return False, f"Invalid rule operator: {operator}"
            
        if passed:
            return True, ""
        return False, err_msg
        
    except ValueError as e:
        logger.error(f"Value casting failed in rule evaluation: {str(e)}")
        return False, f"Type mismatch comparing {field} value."
    except Exception as e:
        logger.error(f"Unexpected error in rule evaluation: {str(e)}")
        return False, f"Evaluation error: {str(e)}"

def evaluate_scheme_eligibility(profile: Profile, scheme_name: str, rules: List[EligibilityRule]) -> Tuple[bool, List[RuleMatchStatus]]:
    """
    Evaluates all active rules of a scheme against the profile.
    """
    rules_checked = []
    scheme_eligible = True
    
    for rule in rules:
        if not rule.is_active:
            continue
            
        passed, msg = evaluate_rule(profile, rule)
        if not passed:
            scheme_eligible = False
            
        rules_checked.append(RuleMatchStatus(
            field_name=rule.field_name,
            description=rule.error_message or f"Check {rule.field_name}",
            passed=passed,
            error_message=None if passed else msg
        ))
        
    return scheme_eligible, rules_checked
