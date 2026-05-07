import fs from 'fs';
import path from 'path';

describe('AssetCard long-name layout protections', () => {
  const assetCardPath = path.join(__dirname, '../src/components/AssetCard.tsx');
  const source = fs.readFileSync(assetCardPath, 'utf8');

  it('uses one-line tail ellipsis for asset name text', () => {
    expect(source).toContain('numberOfLines={1}');
    expect(source).toContain('ellipsizeMode="tail"');
  });

  it('applies shrink-safe styles to prevent overlap with amount text', () => {
    expect(source).toMatch(/nameText:\s*\{[\s\S]*flex:\s*1,[\s\S]*flexShrink:\s*1,/);
    expect(source).toMatch(/nameContainer:\s*\{[\s\S]*minWidth:\s*0,/);
    expect(source).toMatch(/amountText:\s*\{[\s\S]*maxWidth:\s*'45%'/);
  });
});
