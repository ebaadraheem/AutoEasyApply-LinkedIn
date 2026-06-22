import time, math, random, os
import utils, constants, config
import pickle, hashlib
import logging

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("linkedin_bot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Linkedin:
    def __init__(self):
        utils.prYellow("🤖 Thanks for using Easy Apply Jobs bot, for more information you can visit our site - www.automated-bots.com")
        utils.prYellow("🌐 Bot will run in Chrome browser and log in Linkedin for you.")
        self.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=utils.chromeBrowserOptions())
        self.wait = WebDriverWait(self.driver, 10)  # Adding explicit wait
        self.cookies_path = f"{os.path.join(os.getcwd(),'cookies')}/{self.getHash(config.email)}.pkl"
        self.driver.get('https://www.linkedin.com')
        self.loadCookies()

        if not self.isLoggedIn():
            self.driver.get("https://www.linkedin.com/login?trk=guest_homepage-basic_nav-header-signin")
            utils.prYellow("🔄 Trying to log in Linkedin...")
            try:    
                self.driver.find_element("id", "username").send_keys(config.email)
                time.sleep(2)
                self.driver.find_element("id", "password").send_keys(config.password)
                time.sleep(2)
                self.driver.find_element("xpath", '//button[@type="submit"]').click()
                time.sleep(30)  # Wait for login to complete
            except Exception as e:
                utils.prRed(f"❌ Couldn't log in Linkedin: {str(e)}")
                logger.error(f"Login failed: {str(e)}")

        # start application
        self.linkJobApply()

    def getHash(self, string):
        return hashlib.md5(string.encode('utf-8')).hexdigest()

    def loadCookies(self):
        if os.path.exists(self.cookies_path):
            cookies = pickle.load(open(self.cookies_path, "rb"))
            self.driver.delete_all_cookies()
            for cookie in cookies:
                self.driver.add_cookie(cookie)

    def saveCookies(self):
        if not os.path.exists('cookies'):
            os.makedirs('cookies')
        pickle.dump(self.driver.get_cookies(), open(self.cookies_path, "wb"))
    
    def isLoggedIn(self):
        self.driver.get('https://www.linkedin.com/feed')
        try:
            # Look for an element that indicates logged in state
            self.driver.find_element(By.XPATH, "//div[contains(@class, 'feed-identity-module')]")
            logger.info("Successfully logged in")
            return True
        except:
            logger.info("Not logged in")
            return False 
                        
    def generateUrls(self):
        if not os.path.exists('data'):
            os.makedirs('data')
        try: 
            with open('data/urlData.txt', 'w', encoding="utf-8") as file:
                linkedinJobLinks = utils.LinkedinUrlGenerate().generateUrlLinks()
                for url in linkedinJobLinks:
                    file.write(url + "\n")
            utils.prGreen("✅ Apply urls are created successfully, now the bot will visit those urls.")
        except Exception as e:
            utils.prRed(f"❌ Couldn't generate urls: {str(e)}")
            logger.error(f"URL generation failed: {str(e)}")

    def linkJobApply(self):
        self.generateUrls()
        countApplied = 0
        countJobs = 0

        urlData = utils.getUrlDataFile()

        for url in urlData:        
            self.driver.get(url)
            time.sleep(random.uniform(2, constants.botSpeed))

            try:
                totalJobs = self.driver.find_element(By.XPATH, '//small').text 
                totalPages = utils.jobsToPages(totalJobs)

                urlWords = utils.urlToKeywords(url)
                lineToWrite = f"\n Category: {urlWords[0]}, Location: {urlWords[1]}, Applying {totalJobs} jobs."
                self.displayWriteResults(lineToWrite)

                for page in range(totalPages):
                    currentPageJobs = constants.jobsPerPage * page
                    pageUrl = url + "&start=" + str(currentPageJobs)
                    self.driver.get(pageUrl)
                    time.sleep(random.uniform(2, constants.botSpeed))

                    offersPerPage = self.driver.find_elements(By.XPATH, '//li[@data-occludable-job-id]')
                    offerIds = [(offer.get_attribute("data-occludable-job-id").split(":")[-1]) 
                               for offer in offersPerPage 
                               if not self.element_exists(offer, By.XPATH, ".//*[contains(text(), 'Applied')]")]
                    
                    time.sleep(random.uniform(1, constants.botSpeed))

                    for jobID in offerIds:
                        offerPage = 'https://www.linkedin.com/jobs/view/' + str(jobID)
                        self.driver.get(offerPage)
                        time.sleep(random.uniform(2, constants.botSpeed))

                        countJobs += 1

                        jobProperties = self.getJobProperties(countJobs)
                        if "blacklisted" in jobProperties: 
                            lineToWrite = jobProperties + " | " + "* 🤬 Blacklisted Job, skipped!: " + str(offerPage)
                            self.displayWriteResults(lineToWrite)
                            continue
                        
                        easyApplyButton = self.easyApplyButton()

                        if easyApplyButton is not False:
                            try:
                                easyApplyButton.click()
                                time.sleep(random.uniform(2, constants.botSpeed))
                                
                                # Attempt to complete the application
                                result = self.completeApplication(offerPage)
                                lineToWrite = jobProperties + " | " + result
                                self.displayWriteResults(lineToWrite)
                                
                                if "Applied" in result:
                                    countApplied += 1
                                
                            except Exception as e:
                                logger.error(f"Error applying to job {offerPage}: {str(e)}")
                                lineToWrite = jobProperties + f" | * 🥵 Error applying to this job: {str(offerPage)}, Error: {str(e)[:100]}"
                                self.displayWriteResults(lineToWrite)
                        else:
                            lineToWrite = jobProperties + " | " + "* 🥳 Already applied or not available! Job: " + str(offerPage)
                            self.displayWriteResults(lineToWrite)

                utils.prYellow(f"Category: {urlWords[0]}, {urlWords[1]} applied: {countApplied} jobs out of {countJobs}.")
            
            except Exception as e:
                logger.error(f"Error processing URL {url}: {str(e)}")
                utils.prRed(f"❌ Error processing URL {url}: {str(e)}")
        
        utils.donate(self)

    def completeApplication(self, offerPage):
        """Complete the multi-step application process"""
        try:
            # First check if we can do a one-click apply
            try:
                submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit application']")
                if submit_button.is_displayed() and submit_button.is_enabled():
                    self.chooseResume()
                    submit_button.click()
                    time.sleep(random.uniform(2, constants.botSpeed))
                    return "* 🥳 Just Applied to this job (quick apply): " + str(offerPage)
            except NoSuchElementException:
                pass  # No one-click option, proceed with multi-step
            
            # For multi-step applications, get the initial completion percentage
            try:
                # Choose resume if needed on first page
                self.chooseResume()
                
                # Check if we need to continue to the next step
                try:
                    next_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Continue to next step']")
                    if next_button.is_displayed() and next_button.is_enabled():
                        next_button.click()
                        time.sleep(random.uniform(2, constants.botSpeed))
                except (NoSuchElementException, ElementClickInterceptedException):
                    pass  # No next button or couldn't click it
                
                # Now track our progress
                progress_found = False
                try:
                    progress_element = self.driver.find_element(By.XPATH, '//span[contains(@class, "artdeco-completeness-meter-linear__progress")]')
                    progress_style = progress_element.get_attribute("style")
                    if "width" in progress_style:
                        width_str = progress_style.split("width:")[1].split("%")[0].strip()
                        current_progress = float(width_str)
                        progress_found = True
                        logger.info(f"Current application progress: {current_progress}%")
                except:
                    logger.info("Could not determine application progress percentage")
                
                # If we couldn't find the progress, look for the step indicator
                if not progress_found:
                    try:
                        steps = self.driver.find_elements(By.XPATH, '//li[contains(@class, "artdeco-completeness-meter-linear__step")]')
                        total_steps = len(steps)
                        active_step = 0
                        for i, step in enumerate(steps):
                            if "artdeco-completeness-meter-linear__step--active" in step.get_attribute("class"):
                                active_step = i + 1
                                break
                        
                        if total_steps > 0:
                            current_progress = (active_step / total_steps) * 100
                            logger.info(f"Current application step: {active_step}/{total_steps} ({current_progress}%)")
                        else:
                            current_progress = 0
                    except:
                        current_progress = 0
                        logger.info("Could not determine application steps")
                
                # Process each page of the application until we reach the submit button
                max_steps = 10  # Safety limit to prevent infinite loops
                current_step = 1
                
                while current_step < max_steps:
                    logger.info(f"Processing application step {current_step}")
                    
                    # Handle form fields on the current page
                    self.handleFormFields()
                    
                    # Try to find and click submit button first
                    try:
                        submit_button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Submit application']")))
                        if submit_button.is_displayed() and submit_button.is_enabled():
                            # Unfollow company if configured
                            if config.followCompanies is False:
                                try:
                                    follow_checkbox = self.driver.find_element(By.CSS_SELECTOR, "label[for='follow-company-checkbox']")
                                    if follow_checkbox.is_displayed():
                                        follow_checkbox.click()
                                except:
                                    pass
                            
                            submit_button.click()
                            time.sleep(random.uniform(2, constants.botSpeed))
                            return "* 🥳 Just Applied to this job (multi-step): " + str(offerPage)
                    except:
                        pass  # No submit button yet, continue to next step
                    
                    # Try to find and click review button
                    try:
                        review_button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Review your application']")))
                        if review_button.is_displayed() and review_button.is_enabled():
                            review_button.click()
                            time.sleep(random.uniform(2, constants.botSpeed))
                            continue
                    except:
                        pass  # No review button, try next step button
                    
                    # Try to continue to next step
                    try:
                        next_button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Continue to next step']")))
                        if next_button.is_displayed() and next_button.is_enabled():
                            next_button.click()
                            time.sleep(random.uniform(2, constants.botSpeed))
                            current_step += 1
                            continue
                        else:
                            # If button exists but is disabled, there might be required fields
                            logger.info("Next button is disabled, checking for required fields")
                            self.handleFormFields()
                            # Try clicking again after filling fields
                            if next_button.is_enabled():
                                next_button.click()
                                time.sleep(random.uniform(2, constants.botSpeed))
                                current_step += 1
                                continue
                    except TimeoutException:
                        # If we can't find a next button, try to find the submit or review button again
                        try:
                            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit application']")
                            if submit_button.is_displayed() and submit_button.is_enabled():
                                # Unfollow company if configured
                                if config.followCompanies is False:
                                    try:
                                        follow_checkbox = self.driver.find_element(By.CSS_SELECTOR, "label[for='follow-company-checkbox']")
                                        if follow_checkbox.is_displayed():
                                            follow_checkbox.click()
                                    except:
                                        pass
                                
                                submit_button.click()
                                time.sleep(random.uniform(2, constants.botSpeed))
                                return "* 🥳 Just Applied to this job (multi-step): " + str(offerPage)
                        except:
                            pass
                        
                        try:
                            review_button = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Review your application']")
                            if review_button.is_displayed() and review_button.is_enabled():
                                review_button.click()
                                time.sleep(random.uniform(2, constants.botSpeed))
                                continue
                        except:
                            # If we can't find any buttons to proceed, we're probably stuck
                            logger.warning(f"Could not find any buttons to proceed at step {current_step}")
                            return f"* ⚠️ Could not complete application (stuck at step {current_step}): {offerPage}"
                    
                    # If we can't find any way to proceed, break out of the loop
                    logger.warning(f"No clear way to proceed at step {current_step}")
                    return f"* ⚠️ Could not complete application (no clear path at step {current_step}): {offerPage}"
                
                # If we've reached the max steps without submitting, something went wrong
                return f"* ⚠️ Could not complete application (reached max steps): {offerPage}"
                
            except Exception as e:
                logger.error(f"Error in multi-step application: {str(e)}")
                return f"* 🥵 Error during application process: {str(e)[:100]}"
        
        except Exception as e:
            logger.error(f"Error in completeApplication: {str(e)}")
            return f"* 🥵 Application error: {str(e)[:100]}"

    def handleFormFields(self):
        """Handle various form fields in the application"""
        try:
            # Try to find checkboxes and radios that need to be filled
            # Handle radio buttons (select "Yes" for experience, etc.)
            radio_buttons = self.driver.find_elements(By.XPATH, '//input[@type="radio"]')
            for radio in radio_buttons:
                try:
                    # Get the name and try to determine if it's a positive/negative question
                    radio_name = radio.get_attribute("name")
                    radio_value = radio.get_attribute("value")
                    radio_id = radio.get_attribute("id")
                    
                    # Skip if already checked
                    if radio.is_selected():
                        continue
                    
                    # Logic for selecting appropriate radio buttons:
                    # 1. For experience/skills related questions, prefer "Yes"
                    # 2. For other questions, select the first option by default
                    
                    # Get the label text to help with decision making
                    label_text = ""
                    try:
                        label_element = self.driver.find_element(By.XPATH, f'//label[@for="{radio_id}"]')
                        label_text = label_element.text.lower()
                    except:
                        pass
                    
                    # Default to selecting "Yes" for experience/skills
                    if radio_value == "true" or radio_value == "yes" or "yes" in label_text:
                        self.driver.execute_script("arguments[0].click();", radio)
                        logger.info(f"Selected 'Yes' option for {radio_name}")
                        time.sleep(0.5)
                    
                    # For years of experience, prefer highest reasonable value
                    if "years" in radio_name.lower() or "years" in label_text:
                        if any(x in label_text for x in ["3+", "5+", "3-5", "3 or more"]):
                            self.driver.execute_script("arguments[0].click();", radio)
                            logger.info(f"Selected experience option: {label_text}")
                            time.sleep(0.5)
                except Exception as e:
                    logger.warning(f"Could not process radio button: {str(e)}")
            
            # Handle checkboxes for skills/requirements (check all by default)
            checkboxes = self.driver.find_elements(By.XPATH, '//input[@type="checkbox" and not(@checked)]')
            for checkbox in checkboxes:
                try:
                    # Skip the "follow company" checkbox - this is handled separately
                    if "follow-company" in checkbox.get_attribute("id"):
                        continue
                    
                    # Check skills/requirements boxes
                    checkbox_id = checkbox.get_attribute("id")
                    label_text = ""
                    try:
                        label_element = self.driver.find_element(By.XPATH, f'//label[@for="{checkbox_id}"]')
                        label_text = label_element.text.lower()
                    except:
                        pass
                    
                    # Check boxes for skills, legal permissions
                    if any(keyword in label_text for keyword in ["skill", "experience", "legally", "authorized", "require"]):
                        if not checkbox.is_selected():
                            self.driver.execute_script("arguments[0].click();", checkbox)
                            logger.info(f"Checked box: {label_text}")
                            time.sleep(0.5)
                except Exception as e:
                    logger.warning(f"Could not process checkbox: {str(e)}")
            
            # Handle dropdown selects
            selects = self.driver.find_elements(By.XPATH, '//select')
            for select in selects:
                try:
                    select_id = select.get_attribute("id")
                    select_name = select.get_attribute("name").lower()
                    
                    # Skip if already has a value selected
                    if select.get_attribute("value"):
                        continue
                    
                    # Get all options
                    options = select.find_elements(By.XPATH, './option')
                    if len(options) <= 1:  # Skip if no real options (only placeholder)
                        continue
                    
                    # Choose appropriate option based on select name
                    if "experience" in select_name or "years" in select_name:
                        # For experience, select a reasonable but high value
                        for option in options:
                            option_text = option.text.lower()
                            if any(x in option_text for x in ["3+", "3-5", "5+", "3 or more"]):
                                option.click()
                                logger.info(f"Selected '{option_text}' for {select_name}")
                                break
                        else:
                            # If no preferred option found, select the middle option
                            middle_option = options[len(options) // 2]
                            middle_option.click()
                            logger.info(f"Selected middle option '{middle_option.text}' for {select_name}")
                    else:
                        # For other dropdowns, select the first real option
                        for option in options[1:]:  # Skip first option as it's often a placeholder
                            option_value = option.get_attribute("value")
                            if option_value:
                                option.click()
                                logger.info(f"Selected '{option.text}' for {select_name}")
                                break
                except Exception as e:
                    logger.warning(f"Could not process select: {str(e)}")
            
            # Handle text inputs - fill required fields with appropriate values
            inputs = self.driver.find_elements(By.XPATH, '//input[@type="text"]')
            for input_field in inputs:
                try:
                    if input_field.is_displayed() and input_field.is_enabled():
                        input_value = input_field.get_attribute("value")
                        if not input_value:  # Only fill empty fields
                            input_name = input_field.get_attribute("name").lower()
                            input_id = input_field.get_attribute("id").lower()
                            
                            # Check if the field is required
                            is_required = input_field.get_attribute("required") == "true"
                            aria_required = input_field.get_attribute("aria-required") == "true"
                            
                            if is_required or aria_required:
                                # Determine what kind of field this is and fill accordingly
                                if any(x in input_name or x in input_id for x in ["phone", "mobile"]):
                                    input_field.send_keys(config.phone_number if hasattr(config, "phone_number") else "1234567890")
                                elif any(x in input_name or x in input_id for x in ["city", "location"]):
                                    input_field.send_keys(config.location if hasattr(config, "location") else "New York")
                                else:
                                    # Generic required field - just put something
                                    input_field.send_keys("Yes")
                                
                                logger.info(f"Filled required text field: {input_name or input_id}")
                                time.sleep(0.5)
                except Exception as e:
                    logger.warning(f"Could not process text input: {str(e)}")
            
            # Handle textarea fields (like cover letters)
            textareas = self.driver.find_elements(By.XPATH, '//textarea')
            for textarea in textareas:
                try:
                    if textarea.is_displayed() and textarea.is_enabled():
                        textarea_value = textarea.get_attribute("value")
                        if not textarea_value:  # Only fill empty fields
                            textarea_name = textarea.get_attribute("name").lower()
                            textarea_id = textarea.get_attribute("id").lower()
                            
                            # Check if the field is required
                            is_required = textarea.get_attribute("required") == "true"
                            aria_required = textarea.get_attribute("aria-required") == "true"
                            
                            # If it looks like a cover letter field and is required
                            if (is_required or aria_required) and any(x in textarea_name or x in textarea_id for x in ["cover", "letter", "message", "additional"]):
                                if hasattr(config, "cover_letter") and config.cover_letter:
                                    textarea.send_keys(config.cover_letter)
                                else:
                                    textarea.send_keys("I am very interested in this position and believe my skills and experience are a great match. I look forward to discussing my application with you further.")
                                
                                logger.info(f"Filled cover letter/message field: {textarea_name or textarea_id}")
                                time.sleep(0.5)
                except Exception as e:
                    logger.warning(f"Could not process textarea: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error handling form fields: {str(e)}")

    def chooseResume(self):
        try:
            # Check if resume selection is required
            resume_required = len(self.driver.find_elements(By.CLASS_NAME, "jobs-document-upload__title--is-required")) > 0
            
            if resume_required:
                resumes = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'ui-attachment--pdf')]")
                
                # No resumes found, try to upload one if configured
                if len(resumes) == 0:
                    try:
                        upload_button = self.driver.find_element(By.XPATH, "//input[@type='file']")
                        if hasattr(config, "resume_file_path") and config.resume_file_path and os.path.exists(config.resume_file_path):
                            upload_button.send_keys(os.path.abspath(config.resume_file_path))
                            time.sleep(3)  # Wait for upload
                            logger.info("Uploaded resume from file")
                        else:
                            logger.warning("Resume required but no resume found and no file path configured")
                    except Exception as e:
                        logger.warning(f"Could not upload resume: {str(e)}")
                
                # If resumes are available, select the preferred one
                elif len(resumes) == 1 and resumes[0].get_attribute("aria-label") == "Select this resume":
                    resumes[0].click()
                    logger.info("Selected the only available resume")
                elif len(resumes) > 1 and config.preferredCv >= 1 and config.preferredCv <= len(resumes):
                    try:
                        resumes[config.preferredCv-1].click()
                        logger.info(f"Selected resume #{config.preferredCv}")
                    except Exception as e:
                        logger.warning(f"Could not select preferred resume: {str(e)}")
                        # Try to select the first resume as fallback
                        try:
                            resumes[0].click()
                            logger.info("Selected first resume as fallback")
                        except:
                            pass
        except Exception as e:
            logger.warning(f"Error in resume selection: {str(e)}")

    def getJobProperties(self, count):
        textToWrite = ""
        jobTitle = ""
        jobCompany = ""
        jobLocation = ""

        try:
            jobTitle = self.driver.find_element(By.XPATH, "//h1[contains(@class, 'job-title')]").get_attribute("innerHTML").strip()
            # Check for blacklisted titles
            res = [blItem for blItem in config.blackListTitles if (blItem.lower() in jobTitle.lower())]
            if len(res) > 0:
                jobTitle += "(blacklisted title: " + ' '.join(res) + ")"
                return str(count) + " | " + jobTitle + " | blacklisted"
        except Exception as e:
            if config.displayWarnings:
                utils.prYellow(f"⚠️ Warning in getting jobTitle: {str(e)[:50]}")
            jobTitle = "Unknown Title"

        try:
            time.sleep(1)
            jobDetail = self.driver.find_element(By.XPATH, "//div[contains(@class, 'job-details-jobs')]//div").text.replace("·", "|")
            
            # Try to extract company name
            try:
                jobCompany = self.driver.find_element(By.XPATH, "//a[contains(@class, 'ember-view t-black t-normal')]").text
                # Check for blacklisted companies
                res = [blItem for blItem in config.blacklistCompanies if (blItem.lower() in jobCompany.lower())]
                if len(res) > 0:
                    jobCompany += "(blacklisted company: " + ' '.join(res) + ")"
                    return str(count) + " | " + jobTitle + " | " + jobCompany + " | blacklisted"
            except:
                jobCompany = "Unknown Company"
            
        except Exception as e:
            if config.displayWarnings:
                logger.warning(f"Warning in getting jobDetail: {str(e)[:100]}")
            jobDetail = ""

        try:
            jobWorkStatusSpans = self.driver.find_elements(By.XPATH, "//span[contains(@class,'ui-label ui-label--accent-3 text-body-small')]//span[contains(@aria-hidden,'true')]")
            for span in jobWorkStatusSpans:
                jobLocation = jobLocation + " | " + span.text
        except Exception as e:
            if config.displayWarnings:
                logger.warning(f"Warning in getting jobLocation: {str(e)[:100]}")
            jobLocation = ""

        textToWrite = str(count) + " | " + jobTitle + " | " + jobDetail + jobLocation
        return textToWrite

    def easyApplyButton(self):
        try:
            time.sleep(random.uniform(1, constants.botSpeed))
            button = self.driver.find_element(By.XPATH, "//div[contains(@class,'jobs-apply-button--top-card')]//button[contains(@class, 'jobs-apply-button')]")
            return button
        except: 
            return False

    def displayWriteResults(self, lineToWrite: str):
        try:
            print(lineToWrite)
            utils.writeResults(lineToWrite)
        except Exception as e:
            utils.prRed(f"❌ Error in DisplayWriteResults: {str(e)}")
            logger.error(f"Error writing results: {str(e)}")

    def element_exists(self, parent, by, selector):
        return len(parent.find_elements(by, selector)) > 0

if __name__ == "__main__":
    start = time.time()
    
    try:
        bot = Linkedin()
        # Save cookies after successful login
        bot.saveCookies()
    except Exception as e:
        utils.prRed(f"❌ Error running bot: {str(e)}")
        logger.error(f"Bot error: {str(e)}")
    
    end = time.time()
    utils.prYellow(f"---Took: {round((end - start)/60)} minute(s).")