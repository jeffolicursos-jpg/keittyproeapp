Planilhas Google – Templates

- Treinos
  - exercises_base.csv: slug,title,muscle_group,video_url,tips,default_series,default_reps,execution_text,audio_url
    - tips: separe com “;”
    - execution_text: cada linha separada por “\n”
  - training_days.csv: id,title,overview,cardio_title,cardio_prescription
  - training_day_groups.csv: training_day_id,order,exercise_a_slug,exercise_b_slug,prescription
- Receitas
  - recipes.csv: name,porcoes,preparo_min,cozimento_min,temperatura,proteina_g,categoria,ingredientes_text,modo_preparo_text,image_url
    - ingredientes_text: uma linha por ingrediente, formato “quantidade item”
    - modo_preparo_text: uma etapa por linha

Observações
- Imagens serão anexadas manualmente; mantenha image_url em branco.
- Categorias válidas: Café da Manhã, Prato Principal, Lanche, Sopa etc.
- Mantêm compatibilidade com os campos usados pelo app.
