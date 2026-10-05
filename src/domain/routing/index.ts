import { RoutingRule } from "../models";

export function determineDepartment(
  rules: RoutingRule[],
  issueTypeCode: string,
  areaCode?: string
): string | undefined {
  // Sort rules by priority (higher priority first)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  // 1. Exact issue + area match
  if (areaCode) {
    const exactMatch = sortedRules.find(r => r.active && r.issueTypeCode === issueTypeCode && r.areaCode === areaCode);
    if (exactMatch) return exactMatch.departmentId;
  }

  // 2. Issue-only fallback
  const issueMatch = sortedRules.find(r => r.active && r.issueTypeCode === issueTypeCode && !r.areaCode);
  if (issueMatch) return issueMatch.departmentId;

  // 3. Unrouted
  return undefined;
}
