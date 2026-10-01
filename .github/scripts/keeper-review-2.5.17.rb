#!/usr/bin/env ruby
# Keeper2.5.17 review only. Shared guards/submission flow adapted from the verified local release helper.
# API credentials remain in runner memory; only sanitized receipts/history are written.
require 'json'
require 'time'
require 'digest'
require 'open3'
require 'fileutils'
require 'base64'

module KeeperAPIRelease
  BASE = File.expand_path(ENV.fetch('KEEPER_RECEIPTS_DIR', File.join(ENV.fetch('RUNNER_TEMP', '/tmp'), 'keeper-release-receipts')))
  APP = 'io.hexawallet.keeper'
  APP_ID = '1545535925'
  VERSION = '2.5.17'
  BUILD = '617'
  COMMIT = '380196e43ff4838094b6167dc7133f3ef238bd6f'
  SHA = '5bd99a332d53574721ca28dcb7acd2c82d6ead48b33eac29b81337b8fd6b97b5'
  REPOSITORY = 'bithyve/bitcoin-tribe'
  BRANCH = 'release/keeper-2.5.17-review-ci'
  WORKFLOW = '.github/workflows/publish-ios-live.yml'
  APPROVED_NOTES = <<~TEXT.strip
    Improved Recovery Key backup checks and recovery reliability.
    Improved PIN entry responsiveness.
    Corrected recovery events in Version History.
  TEXT
  APPROVED_TEST_NOTES = <<~TEXT.strip
    Check Recovery Key backup status, comparison, retry after reconnecting, and recovery using a disposable wallet. Check rapid PIN entry and verify that Version History distinguishes recovery from app upgrades. Use testnet fixtures and record device-specific results.
  TEXT
  APPROVED_NOTES_SHA = '2eeaff877ba253c660fe983459b168c5ad0af958d5ac190bdc628db7501affc2'
  APPROVED_TEST_NOTES_SHA = '8c62ca9681a8aae749eac7458a030e4ab00eed6943cd717154ec0bac0f433d1f'
  class GuardError < StandardError; end
  def self.guard(value, reason)
    raise GuardError, reason unless value
  end
  def self.write_receipt(name, data)
    target = File.join(BASE, name)
    guard(!File.symlink?(target), 'RECEIPT_SYMLINK')
    File.open(target, File::WRONLY | File::CREAT | File::TRUNC, 0o600) { |f| f.write(JSON.pretty_generate(data) + "\n") }
    File.chmod(0o600, target)
  end
  def self.json(path)
    JSON.parse(File.read(path))
  end
  def self.sha(path)
    Digest::SHA256.file(path).hexdigest
  end
  def self.version_parts(value)
    guard(value.to_s.match?(/\A\d+\.\d+\.\d+\z/), 'UNKNOWN_MARKETING_VERSION')
    value.split('.').map(&:to_i)
  end
  # No IPA or private application source is copied to this job.
  # The operator supplies the sanitized receipt from the exact successful local upload.
  def self.guard_ci_context
    guard(ENV['GITHUB_REPOSITORY'] == REPOSITORY, 'WRONG_CI_REPOSITORY')
    guard(ENV['GITHUB_EVENT_NAME'] == 'workflow_dispatch', 'MANUAL_KEEPER_DISPATCH_REQUIRED')
    guard(ENV['GITHUB_REF'] == "refs/heads/#{BRANCH}", 'ISOLATED_APPROVED_BRANCH_REQUIRED')
    guard(ENV['GITHUB_WORKFLOW_REF'] == "#{REPOSITORY}/#{WORKFLOW}@refs/heads/#{BRANCH}", 'REGISTERED_WORKFLOW_REF_REQUIRED')
    guard(ENV['GITHUB_RUN_ATTEMPT'] == '1', 'DO_NOT_RERUN_MUTATIONS_INSPECT_FIRST')
    guard(ENV['GITHUB_SHA'].to_s.match?(/\A[0-9a-f]{40}\z/), 'WORKFLOW_COMMIT_REQUIRED')
    guard(ENV['GITHUB_RUN_ID'].to_s.match?(/\A[0-9]+\z/), 'WORKFLOW_RUN_ID_REQUIRED')
    guard(BASE == File.join(File.expand_path(ENV.fetch('RUNNER_TEMP')), 'keeper-release-receipts'), 'RECEIPTS_MUST_STAY_IN_RUNNER_TEMP')
    guard(!File.symlink?(BASE), 'RECEIPTS_DIRECTORY_SYMLINK')
    FileUtils.mkdir_p(BASE, mode: 0o700)
    File.chmod(0o700, BASE)
  end
  def self.input_json(name, required:)
    value = ENV.fetch(name, '').strip
    return nil if value.empty? && !required
    guard(!value.empty? && value.bytesize <= 32_000, 'REQUIRED_RECEIPT_JSON_MISSING_OR_OVERSIZED')
    object = JSON.parse(value)
    guard(object.is_a?(Hash), 'RECEIPT_MUST_BE_JSON_OBJECT')
    object
  rescue JSON::ParserError
    raise GuardError, 'RECEIPT_JSON_INVALID'
  end
  def self.same_release?(receipt)
    receipt['application_id'] == APP && receipt['version'] == VERSION && receipt['build'].to_s == BUILD && receipt['sha256'] == SHA && receipt['source_commit'] == COMMIT
  end
  def self.upload_receipt_from_env
    receipt = input_json('KEEPER_UPLOAD_RECEIPT_JSON', required: true)
    allowed = %w[checked_at artifact application_id version build sha256 source_commit exit_code upload_succeeded delivery_id processing app_store_review_submission]
    guard((receipt.keys - allowed).empty?, 'UPLOAD_RECEIPT_HAS_UNEXPECTED_FIELDS')
    guard(same_release?(receipt) && receipt['artifact'] == 'keeper-now-2.5.17-617.ipa' && receipt['exit_code'] == 0 && receipt['upload_succeeded'] == true, 'EXACT_LOCAL_ALTOOL_SUCCESSFUL_UPLOAD_RECEIPT_REQUIRED')
    checked = Time.iso8601(receipt.fetch('checked_at'))
    guard(checked <= Time.now, 'UPLOAD_RECEIPT_TIMESTAMP_IN_FUTURE')
    delivery = receipt['delivery_id']
    guard(delivery.nil? || delivery.match?(/\A[0-9a-f-]{36}\z/i), 'UPLOAD_DELIVERY_ID_INVALID')
    # Copy only validated fixed fields, timestamps and optional delivery UUID.
    sanitized = {checked_at: checked.utc.iso8601, artifact: 'keeper-now-2.5.17-617.ipa', application_id: APP, version: VERSION, build: BUILD, sha256: SHA, source_commit: COMMIT, exit_code: 0, upload_succeeded: true, delivery_id: delivery}
    write_receipt('ios-altool-upload.json', sanitized)
    sanitized
  rescue ArgumentError, KeyError, NoMethodError
    raise GuardError, 'UPLOAD_RECEIPT_SCHEMA_INVALID'
  end
  def self.prepared_receipt_from_env
    receipt = input_json('KEEPER_PREPARED_RECEIPT_JSON', required: true)
    allowed = %w[checked_at application_id app_id version build sha256 source_commit approved_notes_sha256 approved_test_instructions_sha256 verification_basis workflow_commit workflow_run_id workflow_run_attempt prepared_at version_id build_id preserved_metadata_sha256 release_policy notes_sha256 test_instructions_sha256 review_submitted upload_receipt_sha256]
    guard((receipt.keys - allowed).empty?, 'PREPARED_RECEIPT_HAS_UNEXPECTED_FIELDS')
    guard(same_release?(receipt) && receipt['app_id'] == APP_ID && receipt['review_submitted'] == false, 'PREPARED_RECEIPT_RELEASE_MISMATCH')
    guard(receipt['workflow_commit'] == ENV['GITHUB_SHA'], 'PREPARED_WORKFLOW_COMMIT_CHANGED')
    guard(receipt['approved_notes_sha256'] == APPROVED_NOTES_SHA && receipt['approved_test_instructions_sha256'] == APPROVED_TEST_NOTES_SHA && receipt['test_instructions_sha256'] == APPROVED_TEST_NOTES_SHA, 'PREPARED_APPROVED_COPY_MISMATCH')
    guard(receipt['upload_receipt_sha256'] == digest(upload_receipt_from_env), 'PREPARED_UPLOAD_RECEIPT_MISMATCH')
    %w[preserved_metadata_sha256 notes_sha256].each { |field| guard(receipt[field].to_s.match?(/\A[0-9a-f]{64}\z/), 'PREPARED_HASH_INVALID') }
    %w[version_id build_id].each { |field| guard(receipt[field].to_s.match?(/\A[A-Za-z0-9-]{1,128}\z/), 'PREPARED_RESOURCE_ID_INVALID') }
    guard(receipt['verification_basis'] == 'EXACT_LOCAL_ALTOOL_RECEIPT_AND_AUTHENTICATED_BUILD_METADATA', 'PREPARED_VERIFICATION_BASIS_INVALID')
    policy_value = receipt['release_policy']
    guard(policy_value.is_a?(Hash) && policy_value.keys.sort == %w[earliest_release_date phased_release_enabled release_type] && %w[AFTER_APPROVAL MANUAL SCHEDULED].include?(policy_value['release_type']) && [true, false].include?(policy_value['phased_release_enabled']), 'PREPARED_RELEASE_POLICY_INVALID')
    guard(policy_value['earliest_release_date'].nil? || policy_value['earliest_release_date'].to_s.match?(/\A[0-9T:.+Z-]{10,40}\z/), 'PREPARED_RELEASE_DATE_INVALID')
    %w[checked_at prepared_at].each { |field| Time.iso8601(receipt.fetch(field)) }
    guard((0..86_400).cover?(Time.now - Time.iso8601(receipt.fetch('prepared_at'))), 'PREPARED_RECEIPT_STALE_OR_FUTURE')
    guard(receipt['notes_sha256'] == digest({'en-US' => APPROVED_NOTES}), 'PREPARED_RELEASE_NOTES_NOT_APPROVED_COPY')
    %w[workflow_run_id workflow_run_attempt].each { |field| guard(receipt[field].to_s.match?(/\A[0-9]+\z/), 'PREPARED_WORKFLOW_RUN_INVALID') }
    write_receipt('api-prepared-version.json', receipt)
    receipt
  rescue ArgumentError, KeyError
    raise GuardError, 'PREPARED_RECEIPT_SCHEMA_INVALID'
  end
  def self.offline_checks(command)
    guard_ci_context
    guard(Digest::SHA256.hexdigest(APPROVED_NOTES) == APPROVED_NOTES_SHA && Digest::SHA256.hexdigest(APPROVED_TEST_NOTES) == APPROVED_TEST_NOTES_SHA, 'APPROVED_PUBLIC_COPY_CHANGED')
    local = {checked_at: Time.now.utc.iso8601, application_id: APP, app_id: APP_ID, version: VERSION, build: BUILD, sha256: SHA, source_commit: COMMIT, approved_notes_sha256: APPROVED_NOTES_SHA, approved_test_instructions_sha256: APPROVED_TEST_NOTES_SHA, verification_basis: 'PINNED_RELEASE_IDENTIFIERS_NO_ARTIFACT_BYTES_IN_RUNNER', workflow_commit: ENV.fetch('GITHUB_SHA'), workflow_run_id: ENV.fetch('GITHUB_RUN_ID'), workflow_run_attempt: ENV.fetch('GITHUB_RUN_ATTEMPT')}
    if %w[prepare submit].include?(command)
      local[:upload_receipt_sha256] = digest(upload_receipt_from_env)
      local[:verification_basis] = 'EXACT_LOCAL_ALTOOL_RECEIPT_PENDING_AUTHENTICATED_BUILD_READBACK'
      prepared_receipt_from_env if command == 'submit'
    end
    local
  end
  def self.credential
    encoded = ENV.fetch('APP_STORE_CONNECT_API_KEY')
    key = Base64.strict_decode64(encoded.gsub(/\s/, ''))
    key_id = ENV.fetch('FASTLANE_APP_STORE_CONNECT_API_KEY_ID')
    issuer = ENV.fetch('APP_STORE_CONNECT_ISSUER_ID')
    guard(key_id.match?(/\A[A-Z0-9]{10}\z/) && issuer.match?(/\A[0-9a-f-]{36}\z/i) && key.include?('-----BEGIN PRIVATE KEY-----'), 'EXISTING_TEAM_API_CREDENTIAL_INVALID')
    {key_id: key_id, issuer_id: issuer, key: key, duration: 600, in_house: false}
  rescue KeyError, ArgumentError
    raise GuardError, 'EXISTING_TEAM_API_CREDENTIAL_MISSING_OR_INVALID'
  end
  # Suppress raw SDK, Transporter and Fastlane output; no credential log is saved.
  def self.quiet
    saved_out = STDOUT.dup; saved_err = STDERR.dup
    STDOUT.reopen(File::NULL, 'w'); STDERR.reopen(File::NULL, 'w')
    yield
  ensure
    STDOUT.reopen(saved_out); STDERR.reopen(saved_err)
    saved_out.close; saved_err.close
  end
  module NoSDKLogs
    def log_request(*args, &block); end
    def log_response(*args, &block); end
  end
  def self.load_dependencies
    require 'fastlane'
    require 'spaceship'
    require 'deliver'
    Spaceship::Client.prepend(NoSDKLogs) unless Spaceship::Client.ancestors.include?(NoSDKLogs)
    FastlaneCore::Globals.verbose = false
  end
  def self.authorize
    @key = credential
    quiet do
      load_dependencies
      Spaceship::ConnectAPI.token = Spaceship::ConnectAPI::Token.create(**@key)
      @app = Spaceship::ConnectAPI::App.find(APP)
    end
    guard(@app && @app.id == APP_ID && @app.bundle_id == APP, 'KEEPER_APP_NOT_ACCESSIBLE')
  end
  def self.metadata(version)
    return nil unless version
    locales = version.get_app_store_version_localizations.sort_by(&:locale).map do |loc|
      text = %w[description keywords marketing_url promotional_text support_url].to_h { |field| [field, loc.public_send(field)] }
      screens = loc.get_app_screenshot_sets.map { |set| [set.screenshot_display_type, (set.app_screenshots || []).map { |s| [s.file_name, s.file_size, s.source_file_checksum] }] }.sort_by(&:first)
      previews = loc.get_app_preview_sets.map { |set| [set.preview_type, (set.app_previews || []).map { |s| [s.file_name, s.file_size, s.source_file_checksum, s.preview_frame_time_code] }] }.sort_by(&:first)
      {locale: loc.locale, metadata: text, screenshots: screens, previews: previews}
    end
    review = version.fetch_app_store_review_detail
    review_fields = %w[contact_first_name contact_last_name contact_phone contact_email demo_account_name demo_account_password demo_account_required notes]
    review_hash = review && Digest::SHA256.hexdigest(JSON.generate(review_fields.to_h { |field| [field, review.public_send(field)] }))
    {copyright: version.copyright, locales: locales, review_details_sha256: review_hash}
  end
  def self.policy(version)
    phase = version.fetch_app_store_version_phased_release
    {release_type: version.release_type, earliest_release_date: version.earliest_release_date, phased_release_enabled: !phase.nil?}
  end
  def self.digest(value)
    Digest::SHA256.hexdigest(JSON.generate(value))
  end
  def self.history
    @builds = Spaceship::ConnectAPI::Build.all(app_id: @app.id, limit: 200)
    @versions = @app.get_app_store_versions(filter: {platform: 'IOS'}, limit: 200)
    @target = @versions.find { |v| v.version_string == VERSION }
    @live = @app.get_live_app_store_version(platform: 'IOS')
    build_rows = @builds.map { |b| {id: b.id, version: b.app_version, build_number: b.version, uploaded_at: b.uploaded_date, state: b.processing_state} }
    version_rows = @versions.map { |v| {id: v.id, version: v.version_string, state: v.app_store_state, platform: v.platform} }
    result = {checked_at: Time.now.utc.iso8601, application_id: APP, app_id: @app.id, authenticated_with: @auth_method, builds: build_rows, versions: version_rows, highestUploadedBuild: @builds.map { |b| Integer(b.version) }.max || 0, highestMarketingVersion: (build_rows.map { |b| b[:version] } + version_rows.map { |v| v[:version] }).max_by { |v| version_parts(v) }, live_release_policy: @live && policy(@live), target_release_policy: @target && policy(@target)}
    write_receipt('api-apple-history.json', result)
    result
  end
  def self.guard_history
    guard(@live, 'CURRENT_LIVE_VERSION_MISSING')
    guard(@builds.none? { |b| Integer(b.version) > BUILD.to_i }, 'NEWER_UPLOADED_BUILD_EXISTS')
    guard(@versions.none? { |v| (version_parts(v.version_string) <=> version_parts(VERSION)) == 1 }, 'NEWER_STORE_VERSION_EXISTS')
    editable = @app.get_edit_app_store_version(platform: 'IOS')
    guard(!editable || editable.version_string == VERSION, 'CONFLICTING_EDITABLE_VERSION')
    candidate = @builds.select { |b| b.version == BUILD }
    guard(candidate.all? { |b| b.app_version == VERSION && b.bundle_id == APP }, 'BUILD_NUMBER_COLLISION')
    guard(candidate.length <= 1, 'DUPLICATE_CANDIDATE_BUILD')
    candidate.first
  end
  def self.release_notes(locales)
    guard(locales.sort == ['en-US'], 'APPROVED_RELEASE_NOTES_REQUIRED_FOR_EVERY_LOCALE')
    {'en-US' => APPROVED_NOTES}
  end
  def self.notes_digest(version)
    digest(version.get_app_store_version_localizations.sort_by(&:locale).to_h { |l| [l.locale, l.whats_new] })
  end
  def self.guard_verified_upload
    upload_receipt_from_env
  end
  def self.processed_candidate
    candidate = guard_history
    guard(candidate && candidate.processing_state == 'VALID' && !candidate.expired, 'CANDIDATE_NOT_PROCESSED_VALID')
    guard(candidate.uses_non_exempt_encryption == false, 'EXPORT_COMPLIANCE_MUST_MATCH_VERIFIED_IPA')
    candidate
  end
  def self.review_readback(version_id)
    submission = @app.get_review_submissions(filter: {platform: 'IOS'}, includes: 'appStoreVersionForReview', limit: 200).find do |item|
      item.app_store_version_for_review&.id == version_id || Spaceship::ConnectAPI::ReviewSubmissionItem.all(review_submission_id: item.id, includes: 'appStoreVersion', limit: 200).any? { |row| row.app_store_version&.id == version_id }
    end
    confirmed = submission && %w[WAITING_FOR_REVIEW IN_REVIEW UNRESOLVED_ISSUES COMPLETE].include?(submission.state)
    {review_submission_id: submission&.id, review_submission_state: submission&.state, submitted_date: submission&.submitted_date, confirmation: confirmed ? 'CONFIRMED_SUBMITTED' : 'PENDING_READBACK'}
  end
  def self.main(command)
    guard(%w[dry-run inspect prepare submit].include?(command), 'USAGE_DRY_RUN_INSPECT_PREPARE_SUBMIT')
    local = offline_checks(command)
    if command == 'dry-run'
      write_receipt('api-helper-dry-run.json', local.merge(status: 'LOCAL_GUARDS_PASSED_NO_NETWORK', apple_mutation: false))
      puts JSON.generate(status: 'LOCAL_GUARDS_PASSED_NO_NETWORK', version: VERSION, build: BUILD)
      return
    end
    quiet { load_dependencies }
    @auth_method = 'ASC_API_KEY'
    authorize
    quiet { history }
    if command == 'inspect'
      puts JSON.generate(status: 'AUTHENTICATED_READ_ONLY', authenticated_with: @auth_method, version: VERSION, build: BUILD, candidate_processing_state: @builds.find { |b| b.version == BUILD }&.processing_state, store_state: @target&.app_store_state)
      return
    end
    guard_verified_upload
    build = quiet { processed_candidate }
    local[:verification_basis] = 'EXACT_LOCAL_ALTOOL_RECEIPT_AND_AUTHENTICATED_BUILD_METADATA'
    receipt_path = File.join(BASE, 'api-prepared-version.json')
    if command == 'prepare'
      guard(quiet { !@app.get_in_progress_review_submission(platform: 'IOS') }, 'REVIEW_ALREADY_IN_PROGRESS')
      ready = quiet { @app.get_ready_review_submission(platform: 'IOS', includes: 'items') }
      guard(!ready || ready.items.empty?, 'EXISTING_REVIEW_ITEMS_REQUIRE_INSPECTION')
      base_version = @target || @live
      initial_metadata = quiet { metadata(base_version) }
      initial_policy = quiet { policy(base_version) }
      guard(%w[AFTER_APPROVAL MANUAL SCHEDULED].include?(initial_policy[:release_type]), 'UNKNOWN_RELEASE_POLICY')
      guard(@target || initial_policy[:release_type] != 'SCHEDULED', 'NEW_VERSION_NEEDS_ESTABLISHED_SCHEDULE')
      notes = release_notes(initial_metadata[:locales].map { |x| x[:locale] })
      test_notes = APPROVED_TEST_NOTES
      quiet do
        unless @target
          @app.ensure_version!(VERSION, platform: 'IOS')
          @target = @app.get_edit_app_store_version(platform: 'IOS')
          guard(@target && @target.version_string == VERSION, 'CREATED_VERSION_NOT_FOUND')
          @target = @target.update(attributes: {releaseType: initial_policy[:release_type]})
          if initial_policy[:phased_release_enabled] && !@target.fetch_app_store_version_phased_release
            @target.create_app_store_version_phased_release(attributes: {phasedReleaseState: 'INACTIVE'})
          end
        end
        guard(digest(metadata(@target)) == digest(initial_metadata), 'INHERITED_METADATA_ASSETS_OR_REVIEW_DETAILS_DIFFER')
        guard(policy(@target) == initial_policy, 'RELEASE_POLICY_DIFFERED')
        @target.get_app_store_version_localizations.each { |loc| loc.update(attributes: {whatsNew: notes.fetch(loc.locale)}) }
        beta_locales = build.get_beta_build_localizations
        if beta_locales.empty?
          Spaceship::ConnectAPI.post_beta_build_localizations(build_id: build.id, attributes: {locale: 'en-US', whatsNew: test_notes})
        else
          english = beta_locales.find { |loc| loc.locale == 'en-US' }
          if english
            Spaceship::ConnectAPI.patch_beta_build_localizations(localization_id: english.id, attributes: {whatsNew: test_notes})
          else
            Spaceship::ConnectAPI.post_beta_build_localizations(build_id: build.id, attributes: {locale: 'en-US', whatsNew: test_notes})
          end
        end
        @target.select_build(build_id: build.id)
        @target = Spaceship::ConnectAPI::AppStoreVersion.get(app_store_version_id: @target.id)
      end
      english = quiet { build.get_beta_build_localizations.find { |loc| loc.locale == 'en-US' } }
      guard(english && Digest::SHA256.hexdigest(english.whats_new.to_s.strip) == APPROVED_TEST_NOTES_SHA, 'TEST_INSTRUCTIONS_READBACK_DIFFERED')
      final_metadata = quiet { metadata(@target) }
      final_policy = quiet { policy(@target) }
      final_notes = quiet { notes_digest(@target) }
      guard(digest(final_metadata) == digest(initial_metadata) && final_policy == initial_policy, 'PREPARED_METADATA_ASSETS_REVIEW_OR_POLICY_DIFFERED')
      guard(final_notes == digest(notes), 'APPROVED_RELEASE_NOTES_READBACK_DIFFERED')
      guard(quiet { @target.get_build&.id == build.id }, 'PREPARED_ATTACHED_BUILD_READBACK_DIFFERED')
      prepared = local.merge(prepared_at: Time.now.utc.iso8601, version_id: @target.id, build_id: build.id, preserved_metadata_sha256: digest(final_metadata), release_policy: final_policy, notes_sha256: final_notes, test_instructions_sha256: Digest::SHA256.hexdigest(test_notes), review_submitted: false)
      write_receipt('api-prepared-version.json', prepared)
      puts JSON.generate(status: 'VERSION_PREPARED_METADATA_POLICY_PRESERVED_NOT_SUBMITTED', version: VERSION, build: BUILD)
      return
    end
    guard(File.file?(receipt_path), 'PREPARE_RECEIPT_REQUIRED')
    prepared = json(receipt_path)
    guard(@target && @target.id == prepared['version_id'] && build.id == prepared['build_id'], 'PREPARED_VERSION_OR_BUILD_CHANGED')
    guard(same_release?(prepared) && (0..86_400).cover?(Time.now - Time.iso8601(prepared.fetch('prepared_at'))), 'PREPARED_RECEIPT_STALE_OR_WRONG_SOURCE')
    guard(digest(quiet { metadata(@target) }) == prepared['preserved_metadata_sha256'] && quiet { notes_digest(@target) } == prepared['notes_sha256'] && quiet { policy(@target) }.transform_keys(&:to_s) == prepared['release_policy'], 'PREPARED_METADATA_NOTES_OR_POLICY_CHANGED')
    guard(quiet { @target.get_build&.id == build.id }, 'ATTACHED_BUILD_CHANGED')
    english = quiet { build.get_beta_build_localizations.find { |loc| loc.locale == 'en-US' } }
    guard(english && Digest::SHA256.hexdigest(english.whats_new.to_s.strip) == APPROVED_TEST_NOTES_SHA, 'PREPARED_TEST_INSTRUCTIONS_CHANGED')
    guard(quiet { !@app.get_in_progress_review_submission(platform: 'IOS') }, 'REVIEW_ALREADY_IN_PROGRESS')
    ready = quiet { @app.get_ready_review_submission(platform: 'IOS', includes: 'items') }
    guard(!ready || ready.items.empty?, 'EXISTING_REVIEW_ITEMS_REQUIRE_INSPECTION')
    guard(!File.exist?(File.join(BASE, 'api-review-attempt.json')), 'PREVIOUS_REVIEW_ATTEMPT_CHECK_STATUS')
    write_receipt('api-review-attempt.json', local.merge(started_at: Time.now.utc.iso8601, version_id: @target.id, build_id: build.id, state: 'ATTEMPT_STARTED_DO_NOT_BLINDLY_RETRY'))
    quiet do
      Deliver.cache[:app] = @app
      Deliver::SubmitForReview.new.submit!({platform: 'ios', app_version: VERSION, build_number: BUILD, submission_information: {}})
    end
    readback = begin
      quiet do
        @target = Spaceship::ConnectAPI::AppStoreVersion.get(app_store_version_id: @target.id)
        review_readback(@target.id)
      end
    rescue StandardError => error
      {confirmation: 'PENDING_READBACK', readback_error_class: error.class.name}
    end
    result = local.merge(submission_request_succeeded_at: Time.now.utc.iso8601, version_id: @target.id, build_id: build.id, app_store_state: @target.app_store_state, review_request_succeeded: true, public_availability: 'Not claimed; review submission is separate from approval/publication').merge(readback)
    write_receipt('api-review-submission.json', result)
    puts JSON.generate(status: readback[:confirmation] == 'CONFIRMED_SUBMITTED' ? 'APP_STORE_REVIEW_SUBMISSION_CONFIRMED' : 'REVIEW_REQUEST_SUCCEEDED_CONFIRMATION_PENDING', version: VERSION, build: BUILD, review_submission_id: readback[:review_submission_id], review_submission_state: readback[:review_submission_state])
  end
end
if $PROGRAM_NAME == __FILE__
  begin
    KeeperAPIRelease.main(ARGV.fetch(0, 'dry-run'))
  rescue KeeperAPIRelease::GuardError => e
    warn JSON.generate(status: 'GUARD_STOPPED', reason: e.message, apple_submission_not_claimed: true)
    exit 1
  rescue Exception => e
    warn JSON.generate(status: 'STOPPED_CHECK_SANITIZED_RECEIPTS', error_class: e.class.name, apple_submission_not_claimed: true)
    exit 1
  end
end
