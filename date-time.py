import obspython as obs
import datetime

interval    = 10
source_name = ""
label_name = ""
countdown_time = datetime.datetime.now()
pre_min = 30

# ------------------------------------------------------------

def update_text():
    global interval
    global source_name
    global label_name
    global countdown
    global pre_min

    source = obs.obs_get_source_by_name(source_name)
    label = obs.obs_get_source_by_name(label_name)
    if source is not None:
        now = datetime.datetime.now()
        settings = obs.obs_data_create()
        settings2 = obs.obs_data_create()
        d = countdown_time - now;
        if countdown and now < countdown_time and d.seconds < pre_min*60:
            obs.obs_data_set_string(settings2, "text",'COUNTDOWN')
            obs.obs_data_set_string(settings, "text",f'{(d.seconds//60)%60:02}:{d.seconds%60:02}')
        else:
            obs.obs_data_set_string(settings2, "text",now.strftime('%p'))
            obs.obs_data_set_string(settings, "text", now.strftime("%I:%M"))
        obs.obs_source_update(source, settings)
        obs.obs_source_update(label, settings2)
        obs.obs_data_release(settings)
        obs.obs_data_release(settings2)
        obs.obs_source_release(source)
        obs.obs_source_release(label)

def refresh_pressed(props, prop):
    update_text()

# ------------------------------------------------------------

def script_description():
    return "Updates a text source to the current date and time"

def script_defaults(settings):
    obs.obs_data_set_default_int(settings, "interval", 10)
    obs.obs_data_set_default_string(settings, "source", "")
    obs.obs_data_set_default_int(settings, "hour", 10)
    obs.obs_data_set_default_int(settings, "minute", 0)
    obs.obs_data_set_default_int(settings, "pre_min", 30)
    obs.obs_data_set_default_bool(settings, "countdown", False)

def script_properties():
    props = obs.obs_properties_create()

    obs.obs_properties_add_int(props, "interval", "Update Interval (seconds)", 1, 3600, 1)

    obs.obs_properties_add_list(props, "source", "Text Source for Time", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
    obs.obs_properties_add_list(props, "label", "Text Source for Indicator", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)

    obs.obs_properties_add_bool(props, "countdown", "Use Countdown?")
    obs.obs_properties_add_int(props, "hour", "Countdown Time (Hour)", 0, 23, 1)
    obs.obs_properties_add_int(props, "minute", "Countdown Time (Minute)", 0, 59, 1)
    obs.obs_properties_add_int(props, "pre_min", "Count Before (Minute)", 0, 59, 1)
    obs.obs_properties_add_button(props, "button", "Refresh", refresh_pressed)
    return props

def script_update(settings):
    global interval
    global source_name
    global label_name
    global countdown
    global countdown_time
    global pre_min

    interval    = obs.obs_data_get_int(settings, "interval")
    source_name = obs.obs_data_get_string(settings, "source")
    label_name = obs.obs_data_get_string(settings, "label")
    countdown = obs.obs_data_get_bool(settings, "countdown")
    countdown_time = datetime.datetime.now().replace(hour=obs.obs_data_get_int(settings, "hour"),
        minute=obs.obs_data_get_int(settings,"minute"),second=0)
    pre_min = obs.obs_data_get_int(settings, "pre_min")

    obs.timer_remove(update_text)
    
    if source_name != "":
        obs.timer_add(update_text, interval * 1000)
