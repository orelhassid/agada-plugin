/* Agada Admin — Settings page repeater logic */
(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // Generic repeater helpers
  // -------------------------------------------------------------------------

  function removeRow(btn) {
    btn.closest(".agada-repeater-row").remove();
  }

  function attachRemoveListeners(container) {
    container.querySelectorAll(".agada-remove-row").forEach(function (btn) {
      btn.addEventListener("click", function () {
        removeRow(btn);
      });
    });
  }

  // -------------------------------------------------------------------------
  // Special dates repeater
  // -------------------------------------------------------------------------

  var specialDatesContainer = document.getElementById("agada-special-dates-list");
  var addSpecialDateBtn = document.getElementById("agada-special-dates-list")
    ? document.querySelector(".agada-add-special-date")
    : null;

  if (specialDatesContainer) {
    attachRemoveListeners(specialDatesContainer);
  }

  if (addSpecialDateBtn) {
    addSpecialDateBtn.addEventListener("click", function () {
      var row = document.createElement("div");
      row.className = "agada-repeater-row";
      row.innerHTML =
        '<input type="date" name="agada_special_dates_date[]" value="">' +
        '<input type="number" name="agada_special_dates_min[]" value="" placeholder="מינימום מנות" min="1">' +
        '<button type="button" class="button agada-remove-row">הסר</button>';
      specialDatesContainer.appendChild(row);
      row.querySelector(".agada-remove-row").addEventListener("click", function () {
        removeRow(this);
      });
    });
  }

  // -------------------------------------------------------------------------
  // Notices repeater
  // -------------------------------------------------------------------------

  var noticesContainer = document.getElementById("agada-notices-list");
  var addNoticeBtn = document.querySelector(".agada-add-notice");

  if (noticesContainer) {
    attachRemoveListeners(noticesContainer);
  }

  if (addNoticeBtn) {
    addNoticeBtn.addEventListener("click", function () {
      var row = document.createElement("div");
      row.className = "agada-repeater-row agada-notice-row";
      row.innerHTML =
        '<input type="text" name="agada_notices_text[]" value="" placeholder="טקסט ההודעה" class="widefat">' +
        '<div class="agada-date-range">' +
        '<label>מ: <input type="date" name="agada_notices_start[]" value=""></label>' +
        '<label>עד: <input type="date" name="agada_notices_end[]" value=""></label>' +
        "</div>" +
        '<button type="button" class="button agada-remove-row">הסר</button>';
      noticesContainer.appendChild(row);
      row.querySelector(".agada-remove-row").addEventListener("click", function () {
        removeRow(this);
      });
    });
  }

  // -------------------------------------------------------------------------
  // Serialize repeater fields to JSON hidden inputs before form submit
  // -------------------------------------------------------------------------

  var settingsForm = document.querySelector(".agada-admin form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", function () {
      // Special dates → JSON
      var specialHidden = document.getElementById("agada_special_dates");
      if (specialHidden && specialDatesContainer) {
        var dates = [];
        specialDatesContainer.querySelectorAll(".agada-repeater-row").forEach(function (row) {
          var dateInput = row.querySelector('input[name="agada_special_dates_date[]"]');
          var minInput = row.querySelector('input[name="agada_special_dates_min[]"]');
          if (dateInput && minInput && dateInput.value) {
            dates.push({ date: dateInput.value, minPortions: parseInt(minInput.value, 10) || 30 });
          }
        });
        specialHidden.value = JSON.stringify(dates);
      }

      // Notices → JSON
      var noticesHidden = document.getElementById("agada_notices");
      if (noticesHidden && noticesContainer) {
        var notices = [];
        noticesContainer.querySelectorAll(".agada-repeater-row").forEach(function (row) {
          var textInput = row.querySelector('input[name="agada_notices_text[]"]');
          var startInput = row.querySelector('input[name="agada_notices_start[]"]');
          var endInput = row.querySelector('input[name="agada_notices_end[]"]');
          if (textInput && textInput.value) {
            notices.push({
              text: textInput.value,
              startDate: startInput ? startInput.value : "",
              endDate: endInput ? endInput.value : "",
            });
          }
        });
        noticesHidden.value = JSON.stringify(notices);
      }
    });
  }
})();
