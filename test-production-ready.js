const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config({ path: '.env.local' });

async function testProductionReadiness() {
  console.log('🚀 PRODUCTION READINESS TEST\n');

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    requestHandler: {
      requestTimeout: 5000,
      connectionTimeout: 2000
    }
  });

  const models = [
    { id: process.env.INTERVIEW_DEFAULT_MODEL, name: 'Interview (Nova Lite)', target: '<800ms' },
    { id: process.env.RESUME_ANALYSIS_MODEL, name: 'Resume Analysis (Nova Pro)', target: '<2000ms' },
    { id: process.env.FEEDBACK_MODEL, name: 'Feedback (Nova Sonic)', target: '<1500ms' },
    { id: process.env.FAST_MODEL, name: 'Fast Response (Nova Micro)', target: '<500ms' }
  ];

  console.log('🔍 Testing All Production Models:\n');

  const results = [];

  for (const model of models) {
    try {
      const startTime = Date.now();
      
      // Optimized payload for production
      const payload = {
        messages: [{ 
          role: "user", 
          content: [{ text: "Production test: respond with 'OK'" }] 
        }],
        inferenceConfig: {
          maxTokens: 10,
          temperature: 0.1,
          topP: 0.9
        }
      };

      const command = new InvokeModelCommand({
        modelId: model.id,
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      const responseTime = Date.now() - startTime;
      
      const content = result.output?.message?.content?.[0]?.text || 'No response';
      const status = responseTime < parseInt(model.target.replace(/[<>ms]/g, '')) ? '✅' : '⚠️';
      
      console.log(`${status} ${model.name}`);
      console.log(`   Response Time: ${responseTime}ms (target: ${model.target})`);
      console.log(`   Response: "${content.trim()}"`);
      console.log(`   Model ID: ${model.id}\n`);
      
      results.push({
        model: model.name,
        responseTime,
        target: model.target,
        status: status === '✅' ? 'PASS' : 'SLOW',
        content: content.trim()
      });

    } catch (error) {
      console.log(`❌ ${model.name}`);
      console.log(`   Error: ${error.message}\n`);
      
      results.push({
        model: model.name,
        responseTime: 0,
        target: model.target,
        status: 'FAIL',
        error: error.message
      });
    }
  }

  // Performance Summary
  console.log('📊 PERFORMANCE SUMMARY:');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  const avgResponseTime = results
    .filter(r => r.responseTime > 0)
    .reduce((sum, r) => sum + r.responseTime, 0) / 
    results.filter(r => r.responseTime > 0).length;

  console.log(`✅ Models Passing: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log(`⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`🎯 Production Target: <2000ms for all models`);
  
  if (passed === total && avgResponseTime < 2000) {
    console.log('\n🎉 PRODUCTION READY! 🎉');
    console.log('✅ All models responding within target times');
    console.log('✅ Authentication working correctly');
    console.log('✅ Optimized payloads performing well');
    console.log('✅ Ready for deployment');
  } else {
    console.log('\n⚠️  NEEDS ATTENTION');
    console.log('Some models are not meeting performance targets');
  }

  // Test Complete Flow Speed
  console.log('\n🔄 TESTING COMPLETE INTERVIEW FLOW SPEED:');
  
  try {
    const flowStart = Date.now();
    
    // Step 1: Quick Resume Analysis
    const resumeStart = Date.now();
    const resumePayload = {
      messages: [{ 
        role: "user", 
        content: [{ text: `Analyze: "John Smith, Senior Developer, React/Node.js, 5 years experience". Return JSON with overallScore, experienceLevel, detectedRole only.` }] 
      }],
      inferenceConfig: { maxTokens: 200, temperature: 0.3 }
    };

    const resumeResponse = await client.send(new InvokeModelCommand({
      modelId: process.env.RESUME_ANALYSIS_MODEL,
      body: JSON.stringify(resumePayload),
      contentType: "application/json"
    }));
    const resumeTime = Date.now() - resumeStart;

    // Step 2: Quick Interview Question
    const interviewStart = Date.now();
    const interviewPayload = {
      messages: [{ 
        role: "user", 
        content: [{ text: "Ask one technical question for Senior Developer role. Keep it brief." }] 
      }],
      inferenceConfig: { maxTokens: 100, temperature: 0.7 }
    };

    const interviewResponse = await client.send(new InvokeModelCommand({
      modelId: process.env.INTERVIEW_DEFAULT_MODEL,
      body: JSON.stringify(interviewPayload),
      contentType: "application/json"
    }));
    const interviewTime = Date.now() - interviewStart;

    const totalFlowTime = Date.now() - flowStart;

    console.log(`📄 Resume Analysis: ${resumeTime}ms`);
    console.log(`💬 Interview Question: ${interviewTime}ms`);
    console.log(`⏱️  Total Flow Time: ${totalFlowTime}ms`);
    
    if (totalFlowTime < 3000) {
      console.log('✅ Flow speed excellent for production');
    } else {
      console.log('⚠️  Flow may be slow for some users');
    }

  } catch (error) {
    console.log('❌ Flow test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 PRODUCTION READINESS TEST COMPLETE');
  console.log('📋 Review results above for deployment decision');
}

testProductionReadiness().catch(console.error);