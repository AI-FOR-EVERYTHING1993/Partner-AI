#!/usr/bin/env node

console.log('🎯 AMAZON NOVA MODEL ACCESS GUIDE\n');

console.log('📍 STEP 1: Open AWS Console');
console.log('🔗 URL: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess');
console.log('');

console.log('📍 STEP 2: Request Access to These Models:');
console.log('✅ Amazon Nova Pro (amazon.nova-pro-v1:0)');
console.log('✅ Amazon Nova Lite (amazon.nova-lite-v1:0)'); 
console.log('✅ Amazon Nova Micro (amazon.nova-micro-v1:0)');
console.log('✅ Amazon Nova 2 Sonic (amazon.nova-2-sonic-v1:0)');
console.log('✅ Amazon Titan Text Embeddings V2 (amazon.titan-embed-text-v2:0)');
console.log('');

console.log('📍 STEP 3: Click "Request model access" button');
console.log('📍 STEP 4: Select all Amazon models listed above');
console.log('📍 STEP 5: Submit request (approval is usually instant)');
console.log('');

console.log('📍 STEP 6: Test Access');
console.log('💻 Run: node test-amazon-models.js');
console.log('');

console.log('🎉 AFTER ACCESS GRANTED:');
console.log('🚀 Your interview AI will have:');
console.log('  - Text generation (Nova Pro/Lite)');
console.log('  - Fast responses (Nova Micro)');
console.log('  - Advanced reasoning (Nova 2 Sonic)');
console.log('  - Resume embeddings (Titan)');
console.log('  - Voice synthesis (Polly - already working!)');
console.log('');

console.log('💰 Cost estimate: $10-30/month for typical usage');
console.log('🎯 All Amazon ecosystem - no third-party dependencies!');

// Try to open the URL automatically
try {
  const { exec } = require('child_process');
  exec('start https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess');
  console.log('\n🌐 Opening AWS Console in your browser...');
} catch (error) {
  console.log('\n💡 Manually open the URL above in your browser');
}