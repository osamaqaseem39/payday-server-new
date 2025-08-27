const fetch = require('node-fetch');

/**
 * Test script to verify jobs API endpoint
 */
async function testJobsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Jobs API...\n');
  
  try {
    // Test 1: Get all active jobs
    console.log('1️⃣ Testing GET /api/jobs (get all active jobs)...');
    const jobsResponse = await fetch(`${baseUrl}/api/jobs`);
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('✅ Success! Status:', jobsResponse.status);
      console.log('📊 Response:', JSON.stringify(jobsData, null, 2));
      
      if (jobsData.data && Array.isArray(jobsData.data)) {
        console.log(`📋 Found ${jobsData.data.length} jobs`);
        
        if (jobsData.data.length > 0) {
          console.log('\n📝 Sample job data:');
          const sampleJob = jobsData.data[0];
          console.log(`   Title: ${sampleJob.title}`);
          console.log(`   Department: ${sampleJob.department}`);
          console.log(`   Location: ${sampleJob.location}`);
          console.log(`   Employment Type: ${sampleJob.employmentType}`);
          console.log(`   Status: ${sampleJob.status}`);
        }
      }
    } else {
      console.log('❌ Failed! Status:', jobsResponse.status);
      const errorText = await jobsResponse.text();
      console.log('Error:', errorText);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Test health endpoint
    console.log('2️⃣ Testing GET / (health check)...');
    const healthResponse = await fetch(`${baseUrl}/`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Success! Status:', healthResponse.status);
      console.log('📊 Response:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ Failed! Status:', healthResponse.status);
      const errorText = await healthResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   cd payday-server');
      console.log('   npm run dev');
    }
  }
}

// Run the test
testJobsAPI();
