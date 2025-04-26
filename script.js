const { jsPDF } = window.jspdf;

// Current language variable - default is English
let currentLang = 'en';

// Language translations for result messages and PDF
const translations = {
  en: {
    lowRisk: "You're at low risk for prediabetes.",
    mediumRisk: "You're at moderate risk.",
    highRisk: "You're at high risk.",
    keepUp: "Keep up healthy habits.",
    addMore: "Add more exercise.",
    consult: "Consult your healthcare provider.",
    reportTitle: "Type 2 Diabetes Risk Report",
    pdfFilename: "diabetes_risk_report.pdf"
  },
  bn: {
    lowRisk: "আপনি প্রাক-ডায়াবেটিসের জন্য কম ঝুঁকিতে আছেন।",
    mediumRisk: "আপনি মাঝারি ঝুঁকিতে আছেন।",
    highRisk: "আপনি উচ্চ ঝুঁকিতে আছেন।",
    keepUp: "স্বাস্থ্যকর অভ্যাস বজায় রাখুন।",
    addMore: "আরো ব্যায়াম করুন।",
    consult: "আপনার স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।",
    reportTitle: "টাইপ ২ ডায়াবেটিস রিস্ক রিপোর্ট",
    pdfFilename: "ডায়াবেটিস_রিস্ক_রিপোর্ট.pdf"
  }
};

// Initialize the app on page load
window.onload = function() {
  // Don't display the name field by default
  document.getElementById('nameField').style.display = 'none';
  
  // Show language popup by default
  document.getElementById('language-popup').style.display = 'flex';
  
  // Check form visibility based on acknowledgment status
  toggleFormVisibility();
};

// Set language and update UI
function setLanguage(lang) {
  currentLang = lang;
  updateLanguageUI();
  document.getElementById('language-popup').style.display = 'none';
}

// Function to toggle form visibility based on acknowledgment
function toggleFormVisibility() {
  const checkbox = document.getElementById('acknowledgeInfo');
  const form = document.getElementById('riskForm');
  
  if (checkbox.checked) {
    form.style.display = 'block';
  } else {
    form.style.display = 'none';
  }
}

// Update all UI elements based on selected language
function updateLanguageUI() {
  // Update all elements with data-en and data-bn attributes
  const elements = document.querySelectorAll('[data-' + currentLang + ']');
  elements.forEach(el => {
    el.textContent = el.getAttribute('data-' + currentLang);
  });
  
  // Update input placeholders
  const inputs = document.querySelectorAll('input[data-' + currentLang + '-placeholder]');
  inputs.forEach(input => {
    input.placeholder = input.getAttribute('data-' + currentLang + '-placeholder');
  });
  
  // Update the name field placeholder based on selected language and who option
  updateNameFieldPlaceholder();
}

// Function to toggle name field visibility
function toggleNameField() {
  const nameField = document.getElementById('nameField');
  nameField.style.display = 'block';
  updateNameFieldPlaceholder();
}

// Update name field placeholder based on selected option and language
function updateNameFieldPlaceholder() {
  const nameInput = document.getElementById('otherPersonName');
  const isOtherSelected = document.querySelector('input[name="who"][value="other"]:checked');
  
  if (currentLang === 'en') {
    if (isOtherSelected) {
      nameInput.placeholder = "Enter Someone's Name (Optional)";
    } else {
      nameInput.placeholder = "Enter Your Name (Optional)";
    }
  } else if (currentLang === 'bn') {
    if (isOtherSelected) {
      nameInput.placeholder = "অন্য কারো নাম লিখুন (ঐচ্ছিক)";
    } else {
      nameInput.placeholder = "আপনার নাম লিখুন (ঐচ্ছিক)";
    }
  }
}

function validateForm() { 
  const form = document.getElementById("riskForm"); 
  
  // Check if any radio button group is unselected
  const radioGroups = ["who", "gender", "age", "family", "bp", "activity", "vegfruit", "smoke", "hasSymptoms"];
  
  // Add female-specific questions if female is selected
  const genderElement = document.querySelector('input[name="gender"]:checked');
  if (genderElement && genderElement.value === 'female') {
    radioGroups.push("gestational", "babyWeight");
  }
  
  // Add symptom questions if 'Yes' is selected for hasSymptoms
  const hasSymptoms = document.querySelector('input[name="hasSymptoms"]:checked');
  if (hasSymptoms && hasSymptoms.value === 'yes') {
    radioGroups.push("frequentUrination", "excessiveThirst", "weightLoss", "blurredVision", "slowHealing");
  }
  
  let unselectedGroups = [];
  
  for (const group of radioGroups) {
    if (!document.querySelector(`input[name="${group}"]:checked`)) {
      unselectedGroups.push(group);
    }
  }
  
  if (unselectedGroups.length > 0) {
    if (currentLang === 'en') {
    alert("⚠️ Please select an option for all required questions.");
    } else {
      alert("⚠️ অনুগ্রহ করে সমস্ত প্রয়োজনীয় প্রশ্নের জন্য একটি বিকল্প নির্বাচন করুন।");
    }
    return false;
  }
  
  // Check for other required fields
  if (!form.checkValidity()) { 
    if (currentLang === 'en') {
    alert("⚠️ Please fill all the required fields."); 
    } else {
      alert("⚠️ অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।");
    }
    return false;
  } 
  
  return true; 
}

function calculateBMI() {
  const feet = parseFloat(document.getElementById('heightFeet').value);
  const inches = parseFloat(document.getElementById('heightInches').value);
  const weight = parseFloat(document.getElementById('weightKg').value);
  
  if (isNaN(feet) || isNaN(inches) || isNaN(weight)) { 
    document.getElementById('bmiResult').innerText = ''; 
    return; 
  }
  
  const meters = (feet * 12 + inches) * 0.0254;
  const bmi = weight / (meters * meters);
  
  // Get the category text based on BMI and current language
  let category;
  if (currentLang === 'en') {
    category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight/Pre-obese' : 'Obese';
  } else {
    category = bmi < 18.5 ? 'কম ওজন' : bmi < 25 ? 'স্বাভাবিক' : bmi < 30 ? 'অতিরিক্ত ওজন/পূর্ব-স্থূলতা' : 'স্থূলতা';
  }
  
  // Set the BMI result text with appropriate language
  if (currentLang === 'en') {
  document.getElementById('bmiResult').innerText = `BMI: ${bmi.toFixed(1)} — ${category}`;
  } else {
    document.getElementById('bmiResult').innerText = `বিএমআই: ${bmi.toFixed(1)} — ${category}`;
  }
}

function calculateScore() { 
  let score = 0; 
  
  // Gender
  const genderElement = document.querySelector('input[name="gender"]:checked');
  if (genderElement && genderElement.value === 'male') score += 1;
  if (genderElement && genderElement.value === 'third') score += 0.5; // Third gender gets 0.5 risk points
  
  // Female-specific questions
  if (genderElement && genderElement.value === 'female') {
    // Gestational diabetes
    const gestationalElement = document.querySelector('input[name="gestational"]:checked');
    if (gestationalElement && gestationalElement.value === 'yes') score += 1;
    
    // Baby with high birth weight
    const babyWeightElement = document.querySelector('input[name="babyWeight"]:checked');
    if (babyWeightElement && babyWeightElement.value === 'yes') score += 1;
  }
  
  // Age
  const ageElement = document.querySelector('input[name="age"]:checked');
  if (ageElement) {
    const age = ageElement.value;
    if (age === '40-59') score += 1; 
    if (age === '60+') score += 2;
  }
  
  // Family history
  const familyElement = document.querySelector('input[name="family"]:checked');
  if (familyElement && familyElement.value === 'yes') score += 1;
  
  // Blood pressure
  const bpElement = document.querySelector('input[name="bp"]:checked');
  if (bpElement) {
    const bp = bpElement.value; 
    if (bp === 'normal') score += 1; 
    if (bp === 'high') score += 2;
  }
  
  // Physical activity
  const activityElement = document.querySelector('input[name="activity"]:checked');
  if (activityElement && activityElement.value === 'no') score += 1;
  
  // BMI
  const bmiResult = document.getElementById('bmiResult').innerText;
  if (bmiResult) {
    // Handle both English and Bangla BMI format
    const bmiText = currentLang === 'en' ? 'BMI:' : 'বিএমআই:';
    const bmiVal = parseFloat(bmiResult.split('—')[0].replace(bmiText, '').trim()) || 0;
    if (bmiVal >= 25 && bmiVal < 30) score += 1; 
    if (bmiVal >= 30) score += 2; 
  }
  
  // Smoking
  const smokeElement = document.querySelector('input[name="smoke"]:checked');
  if (smokeElement && smokeElement.value === 'yes') score += 1;
  
  // Additional symptoms
  const hasSymptoms = document.querySelector('input[name="hasSymptoms"]:checked');
  if (hasSymptoms && hasSymptoms.value === 'yes') {
    // Calculate symptom points (1 point for each "yes")
    const symptomFields = ["frequentUrination", "excessiveThirst", "weightLoss", "blurredVision", "slowHealing"];
    let symptomScore = 0;
    
    symptomFields.forEach(field => {
      const element = document.querySelector(`input[name="${field}"]:checked`);
      if (element && element.value === 'yes') {
        symptomScore += 1;
      }
    });
    
    // Add weighted symptom score (max 2 points for all symptoms)
    if (symptomScore >= 3) {
      score += 2;
    } else if (symptomScore > 0) {
      score += 1;
    }
  }
  
  return score; 
}

function showResult() { 
  if (!validateForm()) return; 
  
  const rawScore = calculateScore(); 
  let displayed;
  
  // Convert score to Bangla digits if Bangla language is selected
  if (currentLang === 'bn') {
    const englishToBanglaDigits = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '/': '/'
    };
    displayed = `${rawScore}/10`.split('').map(char => englishToBanglaDigits[char] || char).join('');
    displayed = displayed.replace('/10', '/১০'); // Ensure "/10" is properly converted
  } else {
    displayed = `${rawScore}/10`;
  }
  
  const risk = rawScore <= 2 ? 'Low' : rawScore <= 5 ? 'Medium' : 'High'; 
  
  document.getElementById('resultScore').innerText = displayed;
  
  // Get risk text based on current language
  let resultText;
  let resultDesc;
  
  if (risk === 'Low') {
    resultText = translations[currentLang].lowRisk;
    resultDesc = translations[currentLang].keepUp;
  } else if (risk === 'Medium') {
    resultText = translations[currentLang].mediumRisk;
    resultDesc = translations[currentLang].addMore;
  } else {
    resultText = translations[currentLang].highRisk;
    resultDesc = translations[currentLang].consult;
  }
  
  const whoValue = document.querySelector('input[name="who"]:checked').value;
  const personName = document.getElementById('otherPersonName').value.trim();
  
  // Adjust text based on who the test is for
  if (currentLang === 'en') {
  if (whoValue === 'other' && personName) {
    resultText = resultText.replace("You're", `${personName} is`);
    resultDesc = resultDesc.replace("Keep", `${personName} should keep`);
    resultDesc = resultDesc.replace("Add", `${personName} should add`);
    resultDesc = resultDesc.replace("Consult", `${personName} should consult`);
  } else if (whoValue === 'other') {
    resultText = resultText.replace("You're", "They're");
    resultDesc = resultDesc.replace("Keep", "They should keep");
    resultDesc = resultDesc.replace("Add", "They should add");
    resultDesc = resultDesc.replace("Consult", "They should consult");
  } else if (whoValue === 'self' && personName) {
    resultText = resultText.replace("You're", `${personName}, you're`);
    }
  } else if (currentLang === 'bn') {
    if (whoValue === 'other' && personName) {
      resultText = resultText.replace("আপনি", `${personName}`);
      resultDesc = resultDesc.replace("রাখুন", `রাখা উচিত`);
      resultDesc = resultDesc.replace("করুন", `করা উচিত`);
    } else if (whoValue === 'other') {
      resultText = resultText.replace("আপনি", "তারা");
      resultDesc = resultDesc.replace("রাখুন", "রাখা উচিত");
      resultDesc = resultDesc.replace("করুন", "করা উচিত");
    } else if (whoValue === 'self' && personName) {
      resultText = `${personName}, ${resultText}`;
    }
  }
  
  document.getElementById('resultText').innerText = resultText;
  document.getElementById('resultDesc').innerText = resultDesc;
  document.getElementById('resultContainer').style.display = 'block'; 
  window.scrollTo({top: document.getElementById('resultContainer').offsetTop, behavior: 'smooth'}); 
}

// Function to convert English numbers to Bangla numbers
function convertToBanglaDigits(text) {
  if (currentLang !== 'bn') return text;
  
  const englishToBanglaDigits = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '/': '/'
  };
  
  return text.toString().split('').map(char => englishToBanglaDigits[char] || char).join('');
}

function toggleTips() {
  const tips = document.getElementById('tipsList'); 
  tips.style.display = tips.style.display === 'block' ? 'none' : 'block';
}

// Function to prepare HTML for PDF report
function preparePDFContent() {
  if (!validateForm()) return false;
  
  calculateBMI(); 
  const rawScore = calculateScore();
  
  // Format score based on language
  let scoreDisplay;
  if (currentLang === 'bn') {
    scoreDisplay = convertToBanglaDigits(`${rawScore}/১০`);
  } else {
    scoreDisplay = `${rawScore}/10`;
  }
  
  const whoValue = document.querySelector('input[name="who"]:checked').value;
  // Get the option text in current language
  let testFor = document.querySelector('input[name="who"]:checked').nextElementSibling.textContent.trim();
  const personName = document.getElementById('otherPersonName').value.trim();
  
  if (personName) {
      testFor += ` (${personName})`;
  }
  
  // Create field labels based on current language
  const fieldLabels = {
    en: {
      testFor: 'Test For',
      gender: 'Gender',
      gestationalDiabetes: 'History of Gestational Diabetes',
      babyWeight: 'Delivered Baby >4.1kg',
      age: 'Age',
      familyHistory: 'Family History of Diabetes',
      bloodPressure: 'Blood Pressure',
      physicalActivity: 'Physical Activity',
      vegFruit: 'Vegetable/Fruit Consumption',
      bmi: 'BMI',
      smoking: 'Smoking',
      hasSymptoms: 'Additional Symptoms',
      frequentUrination: 'Frequent Urination',
      excessiveThirst: 'Excessive Thirst',
      weightLoss: 'Unexplained Weight Loss',
      blurredVision: 'Blurred Vision',
      slowHealing: 'Slow Healing Wounds',
      acknowledgement: 'Information Acknowledgement',
      riskScore: 'Risk Score',
      riskLevel: 'Risk Level'
    },
    bn: {
      testFor: 'কার জন্য পরীক্ষা',
      gender: 'লিঙ্গ',
      gestationalDiabetes: 'গর্ভাবস্থায় ডায়াবেটিসের ইতিহাস',
      babyWeight: '৪.১ কেজির বেশি ওজনের শিশু প্রসব',
      age: 'বয়স',
      familyHistory: 'পরিবারে ডায়াবেটিসের ইতিহাস',
      bloodPressure: 'রক্তচাপ',
      physicalActivity: 'শারীরিক কার্যকলাপ',
      vegFruit: 'শাকসবজি/ফল গ্রহণ',
      bmi: 'বিএমআই',
      smoking: 'ধূমপান',
      hasSymptoms: 'অতিরিক্ত উপসর্গ',
      frequentUrination: 'ঘন ঘন প্রস্রাব',
      excessiveThirst: 'অত্যধিক তৃষ্ণা',
      weightLoss: 'অব্যাখ্যাত ওজন হ্রাস',
      blurredVision: 'ঝাপসা দৃষ্টি',
      slowHealing: 'ধীরে ধীরে ক্ষত সারানো',
      acknowledgement: 'তথ্য স্বীকৃতি',
      riskScore: 'ঝুঁকির স্কোর',
      riskLevel: 'ঝুঁকির মাত্রা'
    }
  };
  
  const labels = fieldLabels[currentLang];
  
  // Base form data (without risk score and risk level)
  const formData = { 
    [labels.testFor]: testFor,
    [labels.gender]: document.querySelector('input[name="gender"]:checked').nextElementSibling.textContent.trim(),
    [labels.acknowledgement]: currentLang === 'en' ? 'Acknowledged' : 'স্বীকৃত'
  };
  
  // Add female-specific questions if female is selected
  const genderElement = document.querySelector('input[name="gender"]:checked');
  if (genderElement && genderElement.value === 'female') {
    formData[labels.gestationalDiabetes] = document.querySelector('input[name="gestational"]:checked').nextElementSibling.textContent.trim();
    formData[labels.babyWeight] = document.querySelector('input[name="babyWeight"]:checked').nextElementSibling.textContent.trim();
  }
  
  // Add remaining form data (excluding risk score and level)
  Object.assign(formData, {
    [labels.age]: document.querySelector('input[name="age"]:checked').nextElementSibling.textContent.trim(),
    [labels.familyHistory]: document.querySelector('input[name="family"]:checked').nextElementSibling.textContent.trim(),
    [labels.bloodPressure]: document.querySelector('input[name="bp"]:checked').nextElementSibling.textContent.trim(),
    [labels.physicalActivity]: document.querySelector('input[name="activity"]:checked').nextElementSibling.textContent.trim(),
    [labels.vegFruit]: document.querySelector('input[name="vegfruit"]:checked').nextElementSibling.textContent.trim(),
    [labels.bmi]: document.getElementById('bmiResult').innerText.replace(currentLang === 'en' ? 'BMI: ' : 'বিএমআই: ', '').trim(),
    [labels.smoking]: document.querySelector('input[name="smoke"]:checked').nextElementSibling.textContent.trim()
  });
  
  // Add symptom information if applicable
  const hasSymptoms = document.querySelector('input[name="hasSymptoms"]:checked');
  formData[labels.hasSymptoms] = document.querySelector('input[name="hasSymptoms"]:checked').nextElementSibling.textContent.trim();
  
  if (hasSymptoms && hasSymptoms.value === 'yes') {
    formData[labels.frequentUrination] = document.querySelector('input[name="frequentUrination"]:checked').nextElementSibling.textContent.trim();
    formData[labels.excessiveThirst] = document.querySelector('input[name="excessiveThirst"]:checked').nextElementSibling.textContent.trim();
    formData[labels.weightLoss] = document.querySelector('input[name="weightLoss"]:checked').nextElementSibling.textContent.trim();
    formData[labels.blurredVision] = document.querySelector('input[name="blurredVision"]:checked').nextElementSibling.textContent.trim();
    formData[labels.slowHealing] = document.querySelector('input[name="slowHealing"]:checked').nextElementSibling.textContent.trim();
  }
  
  // Add risk score and risk level at the end
  formData[labels.riskScore] = scoreDisplay;
  formData[labels.riskLevel] = document.getElementById('resultText').innerText;
  
  // Set title for the PDF report
  document.getElementById('pdfReportTitle').innerText = translations[currentLang].reportTitle;
  
  // Create the content for the PDF
  const contentDiv = document.getElementById('pdfReportContent');
  contentDiv.innerHTML = '';  // Clear previous content
  
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  
  for (const [key, val] of Object.entries(formData)) { 
    const row = document.createElement('tr');
    
    const labelCell = document.createElement('td');
    labelCell.style.padding = '8px';
    labelCell.style.border = '1px solid #ddd';
    labelCell.style.width = '40%';
    labelCell.style.fontWeight = 'bold';
    labelCell.innerText = key;
    
    const valueCell = document.createElement('td');
    valueCell.style.padding = '8px';
    valueCell.style.border = '1px solid #ddd';
    valueCell.innerText = val;
    
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  }
  
  contentDiv.appendChild(table);
  
  // Add tips section
  const tipsTitle = document.createElement('h2');
  tipsTitle.style.fontSize = '16px';
  tipsTitle.style.marginTop = '20px';
  tipsTitle.style.marginBottom = '10px';
  tipsTitle.innerText = currentLang === 'en' ? 'General Tips' : 'সাধারণ টিপস';
  contentDiv.appendChild(tipsTitle);
  
  const tipsList = document.createElement('ul');
  tipsList.style.paddingLeft = '20px';
  
  const tipsElements = document.querySelectorAll('#tipsList li');
  tipsElements.forEach(tipElement => {
    const tipItem = document.createElement('li');
    tipItem.style.marginBottom = '5px';
    tipItem.innerText = tipElement.innerText;
    tipsList.appendChild(tipItem);
  });
  
  contentDiv.appendChild(tipsList);
  
  return true;
}

// New PDF generation method using html2canvas for Bangla support
window.downloadPDF = function() {
  if (!validateForm()) return;
  
  showResult(); // Make sure results are shown and calculated
  preparePDFContent();
  
  const element = document.getElementById('pdfReport');
  element.style.display = 'block'; // Make it visible for html2canvas
  
  // Add a delay to ensure the content renders properly
  setTimeout(() => {
    html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      element.style.display = 'none'; // Hide it again
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(translations[currentLang].pdfFilename);
    }).catch(error => {
      console.error('PDF generation error:', error);
      if (currentLang === 'en') {
        alert('Error generating PDF. Please try again.');
      } else {
        alert('পিডিএফ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
      element.style.display = 'none';
    });
  }, 500); // Half-second delay for rendering
};

// Function to toggle female-specific questions
function toggleFemaleQuestions(action) {
  const femaleQuestions = document.getElementById('femaleQuestions');
  
  if (action === 'show') {
    femaleQuestions.style.display = 'block';
    // Make gestational and babyWeight fields required
    document.querySelectorAll('input[name="gestational"], input[name="babyWeight"]').forEach(input => {
      input.setAttribute('required', 'required');
    });
  } else {
    femaleQuestions.style.display = 'none';
    // Remove required attribute from female-specific fields
    document.querySelectorAll('input[name="gestational"], input[name="babyWeight"]').forEach(input => {
      input.removeAttribute('required');
    });
    // Clear any selections
    document.querySelectorAll('input[name="gestational"], input[name="babyWeight"]').forEach(input => {
      input.checked = false;
    });
  }
}

// Function to toggle symptom questions
function toggleSymptomQuestions(action) {
  const symptomQuestions = document.getElementById('symptomQuestions');
  
  if (action === 'show') {
    symptomQuestions.style.display = 'block';
    // Make symptom fields required
    document.querySelectorAll('input[name="frequentUrination"], input[name="excessiveThirst"], input[name="weightLoss"], input[name="blurredVision"], input[name="slowHealing"]').forEach(input => {
      input.setAttribute('required', 'required');
    });
  } else {
    symptomQuestions.style.display = 'none';
    // Remove required attribute from symptom fields
    document.querySelectorAll('input[name="frequentUrination"], input[name="excessiveThirst"], input[name="weightLoss"], input[name="blurredVision"], input[name="slowHealing"]').forEach(input => {
      input.removeAttribute('required');
    });
    // Clear any selections
    document.querySelectorAll('input[name="frequentUrination"], input[name="excessiveThirst"], input[name="weightLoss"], input[name="blurredVision"], input[name="slowHealing"]').forEach(input => {
      input.checked = false;
    });
  }
}

// Function to toggle blood pressure reference table
function toggleBPTable(action) {
  const bpTable = document.getElementById('bpReferenceTable');
  
  if (action === 'show') {
    bpTable.style.display = 'block';
  } else {
    bpTable.style.display = 'none';
  }
} 